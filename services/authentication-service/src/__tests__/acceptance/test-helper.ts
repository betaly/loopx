import {AuthenticationBindings, ClientType, Strategies, StrategiesOptions} from '@bleco/authentication';
import {Application} from '@loopback/core';
import {ExpressMiddlewareFactory} from '@loopback/express';
import {RestTags} from '@loopback/rest';
import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {
  AdminService,
  AuthClientRepository,
  DefaultRole,
  RoleRepository,
  RoleService,
  TenantRepository,
  TenantService,
  UserRepository,
  UserTenantRepository,
} from '@loopx/user-core';
import Sessions, {SessionOptions} from 'client-sessions';

import {OtpGenerateProvider, OtpProvider, PasswordlessVerifyProvider, VerifyBindings} from '../..';
import {LocalPasswordVerifyProvider, OtpVerifyProvider} from '../../modules/auth';
import {AuthCacheSourceName, AuthDbSourceName} from '../../types';
import {TestingApplication} from '../fixtures/application';
import {OtpSenderProvider} from '../fixtures/providers/otp-sender.provider';

export interface AppWithClient {
  app: TestingApplication;
  client: Client;
}

export async function setupApplication(auth?: StrategiesOptions): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new TestingApplication({
    rest: restConfig,
    auth,
  });

  app.bind(`datasources.config.${AuthDbSourceName}`).to({
    name: AuthDbSourceName,
    connector: 'memory',
  });

  app.bind(`datasources.config.${AuthCacheSourceName}`).to({
    name: 'redis',
    connector: 'kv-memory',
  });

  app.bind(AuthenticationBindings.CURRENT_USER).to({
    id: 1,
    username: 'test_user',
    password: 'temp123!@',
  });

  app.bind(Strategies.Passport.LOCAL_PASSWORD_VERIFIER).toProvider(LocalPasswordVerifyProvider);

  app.bind(VerifyBindings.OTP_GENERATE_PROVIDER).toProvider(OtpGenerateProvider);
  app.bind(VerifyBindings.OTP_PROVIDER).toProvider(OtpProvider);
  app.bind(VerifyBindings.OTP_SENDER_PROVIDER).toProvider(OtpSenderProvider);
  app.bind(Strategies.Passport.OTP_VERIFIER).toProvider(OtpVerifyProvider);
  app.bind(VerifyBindings.PASSWORDLESS_VERIFIER).toProvider(PasswordlessVerifyProvider);

  // add session middleware for autha authentication
  app.expressMiddleware(
    Sessions as ExpressMiddlewareFactory<SessionOptions>,
    {
      cookieName: 'session',
      secret: 'random_string_goes_here',
      duration: 30 * 60 * 1000,
      activeDuration: 5 * 60 * 1000,
    },
    {
      chain: RestTags.ACTION_MIDDLEWARE_CHAIN,
    },
  );

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

interface TestInitialDataRepositories {
  authClientRepo: AuthClientRepository;
  roleRepo: RoleRepository;
  tenantRepo: TenantRepository;
  userRepo: UserRepository;
  userTenantRepo: UserTenantRepository;
  tenantService: TenantService;
  roleService: RoleService;
  adminService: AdminService;
}

export async function setupInitialData(appOrRepos: TestingApplication | TestInitialDataRepositories) {
  let authClientRepo: AuthClientRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let userTenantRepo: UserTenantRepository;
  let tenantService: TenantService;
  let roleService: RoleService;
  let adminService: AdminService;

  if (appOrRepos instanceof Application) {
    authClientRepo = await appOrRepos.getRepository(AuthClientRepository);
    roleRepo = await appOrRepos.getRepository(RoleRepository);
    tenantRepo = await appOrRepos.getRepository(TenantRepository);
    userRepo = await appOrRepos.getRepository(UserRepository);
    userTenantRepo = await appOrRepos.getRepository(UserTenantRepository);
    tenantService = await appOrRepos.getService(TenantService);
    roleService = await appOrRepos.getService(RoleService);
    adminService = await appOrRepos.getService(AdminService);
  } else {
    authClientRepo = appOrRepos.authClientRepo;
    roleRepo = appOrRepos.roleRepo;
    tenantRepo = appOrRepos.tenantRepo;
    userRepo = appOrRepos.userRepo;
    userTenantRepo = appOrRepos.userTenantRepo;
    tenantService = appOrRepos.tenantService;
    roleService = appOrRepos.roleService;
    adminService = appOrRepos.adminService;
  }

  process.env.USER_TEMP_PASSWORD = 'temp123!@';

  await tenantService.initTenants();
  await roleService.initRoles();
  await adminService.initAdministrators();

  const testAuthClient = await authClientRepo.create({
    clientId: 'web',
    clientSecret: 'test',
    redirectUrl: 'http://localhost:4200/login/success',
    accessTokenExpiration: 900,
    refreshTokenExpiration: 86400,
    authCodeExpiration: 180,
    secret: 'poiuytrewq',
    clientType: ClientType.public,
  });

  const testAuthClient2 = await authClientRepo.create({
    clientId: 'mobile',
    clientSecret: 'test',
    redirectUrl: 'http://localhost:4200/login/success',
    accessTokenExpiration: 900,
    refreshTokenExpiration: 86400,
    authCodeExpiration: 180,
    secret: 'poiuytrewq',
  });

  const testAdminRole = await roleRepo.findById(DefaultRole.SuperAdmin);
  const testDefaultRole = await roleRepo.findById(DefaultRole.User);
  const testDefaultTenant = await tenantRepo.findById(DEFAULT_TENANT_CODE);

  const testUser = await userRepo.create({
    id: '1',
    username: 'test_user',
    dob: '1996-11-05',
    authClientIds: [testAuthClient.id!],
    email: 'xyz@gmail.com',
    phone: '+1 (202) 456-1414',
  });

  const testUser2 = await userRepo.create({
    id: '2',
    username: 'test_teacher',
    dob: '1996-11-05',
    email: 'test_teacher@test.com',
    phone: '+8613012345678',
    authClientIds: [testAuthClient.id!],
  });

  await userTenantRepo.createAll([
    {
      userId: testUser.id,
      tenantId: testDefaultTenant.id,
      roleId: testDefaultRole.id,
    },
    {
      userId: testUser2.id,
      tenantId: testDefaultTenant.id,
      roleId: testDefaultRole.id,
    },
  ]);

  return {
    testAuthClient,
    testAuthClient2,
    testAdminRole,
    testDefaultRole,
    testDefaultTenant,
    testUser,
    testUser2,
  };
}

export async function clearInitialData(appOrRepos: TestingApplication | TestInitialDataRepositories) {
  let authClientRepo: AuthClientRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let userTenantRepo: UserTenantRepository;

  if (appOrRepos instanceof Application) {
    authClientRepo = await appOrRepos.getRepository(AuthClientRepository);
    roleRepo = await appOrRepos.getRepository(RoleRepository);
    tenantRepo = await appOrRepos.getRepository(TenantRepository);
    userRepo = await appOrRepos.getRepository(UserRepository);
    userTenantRepo = await appOrRepos.getRepository(UserTenantRepository);
  } else {
    authClientRepo = appOrRepos.authClientRepo;
    roleRepo = appOrRepos.roleRepo;
    tenantRepo = appOrRepos.tenantRepo;
    userRepo = appOrRepos.userRepo;
    userTenantRepo = appOrRepos.userTenantRepo;
  }

  await authClientRepo.deleteAllHard();
  await roleRepo.deleteAllHard();
  await tenantRepo.deleteAllHard();
  await userRepo.deleteAllHard();
  await userTenantRepo.deleteAllHard();
}
