import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {IAuthTenantUser, TenantStatus} from '@loopx/core';
import {
  AdminService,
  AuthClientRepository,
  DefaultRole,
  RoleRepository,
  Roles,
  RoleService,
  Tenant,
  TenantRepository,
  TenantService,
  UserCreationData,
  UserDto,
  UserOperationsService,
  UserRepository,
  UserTenantRepository,
} from '@loopx/user-core';
import * as jwt from 'jsonwebtoken';
import {MarkRequired} from 'ts-essentials';
import {uid} from 'uid';

import {UserServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new UserServiceApplication({
    rest: restConfig,
  });

  await app.boot();
  setUpEnv();
  await app.migrateSchema({existingSchema: 'drop'});

  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

function setUpEnv() {
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_TRACING = '0';
  process.env.ENABLE_OBF = '0';
}

export interface AppWithClient {
  app: UserServiceApplication;
  client: Client;
}

export type SetupData = Awaited<ReturnType<typeof setupData>>;

export async function setupData(app: UserServiceApplication) {
  const tenantRepo = await app.getRepository(TenantRepository);
  const userOpts = await app.getService(UserOperationsService);

  const tenantService = await app.getService(TenantService);
  const roleService = await app.getService(RoleService);
  const adminService = await app.getService(AdminService);

  await tenantService.initTenants();
  await roleService.initRoles();
  await adminService.initAdministrators();

  const tenant = await tenantRepo.create(
    new Tenant({
      name: 'test_tenant',
      status: TenantStatus.ACTIVE,
    }),
  );
  const users: Partial<Record<Roles, UserDto>> = {
    [Roles.User]: await userOpts.create(
      new UserCreationData({
        tenantId: tenant.id,
        roleId: DefaultRole.User,
        userDetails: {
          username: 'test_user',
        },
      }),
      null,
      {activate: true},
    ),
    [Roles.Admin]: await userOpts.create(
      new UserCreationData({
        tenantId: tenant.id,
        roleId: DefaultRole.Admin,
        userDetails: {
          username: 'test_admin',
        },
      }),
      null,
      {activate: true},
    ),
    [Roles.Owner]: await userOpts.create(
      new UserCreationData({
        tenantId: tenant.id,
        roleId: DefaultRole.Owner,
        userDetails: {
          username: 'test_owner',
        },
      }),
      null,
      {activate: true},
    ),
  };

  return {
    tenant,
    users,
  };
}

export async function clearData(app: UserServiceApplication) {
  const authClientRepo = await app.getRepository(AuthClientRepository);
  const tenantRepo = await app.getRepository(TenantRepository);
  const userRepo = await app.getRepository(UserRepository);
  const roleRepo = await app.getRepository(RoleRepository);
  const userTenantRepo = await app.getRepository(UserTenantRepository);

  await Promise.all([
    tenantRepo.deleteAllHard(),
    userRepo.deleteAllHard(),
    userTenantRepo.deleteAllHard(),
    authClientRepo.deleteAllHard(),
    roleRepo.deleteAllHard(),
  ]);
}

export function toTenantUser(
  user: MarkRequired<Partial<IAuthTenantUser>, 'role' | 'tenantId'> | UserDto,
): IAuthTenantUser {
  if (isUserDto(user)) {
    const {userDetails, ...rest} = user;
    return {
      authClientId: 0,
      ...rest,
      ...userDetails,
      role: user.roleId,
    };
  } else {
    return {
      id: uid(10),
      userTenantId: uid(10),
      username: 'test_user',
      authClientId: 0,
      ...user,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUserDto(user: any): user is UserDto {
  return user.userDetails !== undefined;
}

export function buildAccessToken(user: IAuthTenantUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: 180000,
    issuer: JWT_ISSUER,
  });
}
