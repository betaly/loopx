import {AuthenticationBindings} from '@bleco/authentication';
import {Client, expect} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {
  DefaultRole,
  Role,
  RoleRepository,
  Tenant,
  TenantRepository,
  User,
  UserRepository,
  UserTenant,
  UserTenantRepository,
} from '@loopx/user-core';
import * as jwt from 'jsonwebtoken';
import {uid} from 'uid';

import {UserServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';
import {setupApplication, toTenantUser} from './test-helper';

describe('UserTenantPrefs Controller', function () {
  let app: UserServiceApplication;
  let userTenantRepo: UserTenantRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  const basePath = '/ut-prefs';
  let client: Client;
  let token: string;
  const tenantName = 'sample_tenant';
  let testUser: IAuthTenantUser;
  const data = {
    userTenantId: '',
    configValue: {value: 'sample value'},
    configKey: 'last-accessd-url',
  };

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });
  beforeAll(givenRepositories);
  // beforeAll(setCurrentUser);
  beforeAll(setupMockData);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(basePath).expect(401);
    expect(response).to.have.property('error');
  });

  it('gives status 200 when token is passed ', async () => {
    await client.get(basePath).set('authorization', `Bearer ${token}`).expect(200);
  });

  it('gives status 422 when request body is invalid', async () => {
    const userTenantPrefs = {};
    await client.post(basePath).set('authorization', `Bearer ${token}`).send(userTenantPrefs).expect(422);
  });

  it('gives status 204 when a new userTenantPref is created', async () => {
    await client.post(basePath).set('authorization', `Bearer ${token}`).send(data).expect(204);
  });

  async function givenRepositories() {
    userTenantRepo = await app.getRepository(UserTenantRepository);
    userRepo = await app.getRepository(UserRepository);
    roleRepo = await app.getRepository(RoleRepository);
    tenantRepo = await app.getRepository(TenantRepository);
  }

  async function setupMockData() {
    const user = await userRepo.create(
      new User({
        username: 'tenant_pref_test_user',
        email: 'abc@xyz',
      }),
    );

    const role = await roleRepo.create(
      new Role({
        name: 'test_admin',
        code: DefaultRole.Owner,
      }),
    );

    const code = uid(10);
    const tenant = await tenantRepo.create(
      new Tenant({
        name: tenantName,
        code,
        status: 1,
      }),
    );
    const userTenant = await userTenantRepo.create(
      new UserTenant({
        userId: user.id,
        tenantId: tenant.id,
        roleId: role.id,
      }),
    );
    testUser = toTenantUser({
      ...user,
      userTenantId: userTenant.id,
      tenantId: tenant.id,
      role: role.code,
    });
    if (testUser.userTenantId) {
      data.userTenantId = testUser.userTenantId;
    }
    setCurrentUser();
  }

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    token = jwt.sign(testUser, JWT_SECRET, {
      expiresIn: 180000,
      issuer: JWT_ISSUER,
    });
  }
});
