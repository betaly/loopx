import Sessions, {SessionOptions} from 'client-sessions';

import {Application} from '@loopback/core';
import {ExpressMiddlewareFactory} from '@loopback/express';
import {RestTags} from '@loopback/rest';
import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';

import {AuthenticationBindings, ClientType, Strategies, StrategiesOptions} from '@bleco/authentication';

import {RoleTypes, extractPermissions} from '@loopx/core';

import {
  AuthSecureClientRepository,
  OtpGenerateProvider,
  OtpProvider,
  PasswordlessVerifyProvider,
  PermissionKey,
  RoleRepository,
  TenantRepository,
  UserRepository,
  UserTenantRepository,
  VerifyBindings,
} from '../..';
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
  authClientRepo: AuthSecureClientRepository;
  roleRepo: RoleRepository;
  tenantRepo: TenantRepository;
  userRepo: UserRepository;
  userTenantRepo: UserTenantRepository;
}

export async function setupInitialData(appOrRepos: TestingApplication | TestInitialDataRepositories) {
  let authClientRepo: AuthSecureClientRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let userTenantRepo: UserTenantRepository;

  if (appOrRepos instanceof Application) {
    authClientRepo = await appOrRepos.getRepository(AuthSecureClientRepository);
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

  process.env.USER_TEMP_PASSWORD = 'temp123!@';

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

  const testAdminRole = await roleRepo.create({
    id: '1',
    name: 'admin',
    roleType: RoleTypes.Admin,
    permissions: [
      'canLoginToIPS',
      'ViewOwnUser',
      'ViewAnyUser',
      'ViewTenantUser',
      'CreateAnyUser',
      'CreateTenantUser',
      'UpdateOwnUser',
      'UpdateTenantUser',
      'UpdateAnyUser',
      'DeleteTenantUser',
      'DeleteAnyUser',
      'ViewTenant',
      'CreateTenant',
      'UpdateTenant',
      'DeleteTenant',
      'ViewRole',
      'CreateRole',
      'UpdateRole',
      'DeleteRole',
      'ViewAudit',
      'CreateAudit',
      'UpdateAudit',
      'DeleteAudit',
      ...extractPermissions(PermissionKey),
    ],
    allowedClients: [testAuthClient.clientId, testAuthClient2.clientId],
  });

  const testDefaultRole = await roleRepo.create({
    id: '2',
    name: 'default',
    roleType: RoleTypes.Default,
    permissions: [
      'ViewOwnUser',
      'ViewTenantUser',
      'CreateTenantUser',
      'UpdateOwnUser',
      'UpdateTenantUser',
      'DeleteTenantUser',
      'ViewTenant',
      'ViewRole',
    ],
    allowedClients: [testAuthClient.clientId],
  });

  const testDefaultTenant = await tenantRepo.create({
    id: '1',
    name: 'Default Tenant',
    key: 'default',
    status: 1,
  });

  const testUser = await userRepo.create({
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    username: 'test_user',
    dob: '1996-11-05',
    authClientIds: [testAuthClient.id],
    email: 'xyz@gmail.com',
    phone: '+1 (202) 456-1414',
  });

  const testUser2 = await userRepo.create({
    id: '2',
    firstName: 'Test',
    lastName: 'Teacher',
    username: 'test_teacher',
    dob: '1996-11-05',
    email: 'test_teacher@test.com',
    phone: '+8613012345678',
    authClientIds: [testAuthClient.id],
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
  let authClientRepo: AuthSecureClientRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let userTenantRepo: UserTenantRepository;

  if (appOrRepos instanceof Application) {
    authClientRepo = await appOrRepos.getRepository(AuthSecureClientRepository);
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
