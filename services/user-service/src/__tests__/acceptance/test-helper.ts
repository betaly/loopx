import {RepositoryTags} from '@loopback/repository';
import {Client, createRestAppClient, givenHttpServerConfig, supertest} from '@loopback/testlab';
import {IAuthTenantUser, TenantStatus} from '@loopx/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {
  AdminService,
  DefaultRole,
  Roles,
  RoleService,
  SUPERADMIN_USER_IDENTIFIER,
  Tenant,
  TenantRepository,
  TenantService,
  TenantUserData,
  TenantUserView,
  UserOperationsService,
  UserRepository,
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
  const userRepo = await app.getRepository(UserRepository);
  const userOpts = await app.getService(UserOperationsService);

  const tenantService = await app.getService(TenantService);
  const roleService = await app.getService(RoleService);
  const adminService = await app.getService(AdminService);

  await tenantService.initTenants();
  await roleService.initRoles();
  await adminService.initAdministrators();

  const tenant1 = await tenantRepo.create(
    new Tenant({
      name: 'test_tenant_1',
      status: TenantStatus.ACTIVE,
    }),
  );

  const tenant2 = await tenantRepo.create(
    new Tenant({
      name: 'test_tenant_2',
      status: TenantStatus.ACTIVE,
    }),
  );

  const superadmin = await userRepo.findOne({where: {username: SUPERADMIN_USER_IDENTIFIER}});

  const users: Partial<Record<Roles, IAuthTenantUser>> = {
    [Roles.User]: toTenantUser(
      await userOpts.create(
        new TenantUserData({
          tenantId: tenant1.id,
          roleId: DefaultRole.User,
          userDetails: {
            username: 'test_user',
          },
        }),
        null,
        {activate: true},
      ),
    ),
    [Roles.Admin]: toTenantUser(
      await userOpts.create(
        new TenantUserData({
          tenantId: tenant1.id,
          roleId: DefaultRole.Admin,
          userDetails: {
            username: 'test_admin',
          },
        }),
        null,
        {activate: true},
      ),
    ),
    [Roles.Owner]: toTenantUser(
      await userOpts.create(
        new TenantUserData({
          tenantId: tenant1.id,
          roleId: DefaultRole.Owner,
          userDetails: {
            username: 'test_owner',
          },
        }),
        null,
        {activate: true},
      ),
    ),
    [Roles.SuperAdmin]: {
      id: superadmin!.id,
      role: Roles.SuperAdmin,
      tenantId: DEFAULT_TENANT_CODE,
      username: superadmin!.username,
      authClientId: 0,
    },
  };

  return {
    tenant1,
    tenant2,
    users,
  };
}

export async function clearData(app: UserServiceApplication) {
  const bindings = app.findByTag(RepositoryTags.REPOSITORY);
  for (const binding of bindings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = await app.get<any>(binding.key);
    if (!repo.deleteAll && !repo.deleteAllHard) continue;
    await (repo.deleteAllHard ?? repo.deleteAll)();
  }
}

export function toTenantUser(
  user: MarkRequired<Partial<IAuthTenantUser>, 'role' | 'tenantId'> | TenantUserView,
): IAuthTenantUser {
  if (isTenantUserView(user)) {
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
function isTenantUserView(user: any): user is TenantUserView {
  return user.userDetails !== undefined;
}

export function buildAccessToken(user: IAuthTenantUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: 180000,
    issuer: JWT_ISSUER,
  });
}

export async function assertPermissions(
  test: supertest.Test,
  role: string | null,
  token: string,
  expectedStatus: number,
) {
  if (!role || role === 'anonymous') {
    await test.expect(expectedStatus);
  } else {
    await test.set('Authorization', 'Bearer ' + token).expect(expectedStatus);
  }
}
