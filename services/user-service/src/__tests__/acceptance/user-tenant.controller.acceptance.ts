import {AuthenticationBindings} from '@bleco/authentication';
import {Client} from '@loopback/testlab';
import * as jwt from 'jsonwebtoken';
import {nanoid} from 'nanoid';

import {PermissionKey} from '../../enums';
import {Role, Tenant, User, UserTenant} from '../../models';
import {RoleRepository, TenantRepository, UserRepository, UserTenantRepository} from '../../repositories';
import {UserOperationsService} from '../../services';
import {UserTenantServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';
import {setupApplication} from './test-helper';

interface USER {
  id: string | undefined;
  userTenantId: string | undefined;
  username: string;
  tenantId: string | undefined;
  password: string;
  permissions: PermissionKey[];
}

describe('UserTenant Controller', function () {
  let app: UserTenantServiceApplication;
  let userTenantRepo: UserTenantRepository;
  let roleRepo: RoleRepository;
  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  const basePath = '/ut';
  let client: Client;
  let token: string;
  const pass = 'test_password';
  const tenantName = 'sample_tenant';
  let testUser: USER = {
    id: '',
    userTenantId: undefined,
    username: '',
    tenantId: undefined,
    password: pass,
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
    ],
  };

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
  beforeAll(setCurrentUser);
  beforeAll(setupMockData);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(`${basePath}/3`).expect(401);
    expect(response).toHaveProperty('error');
  });

  it('gives status 404 when entity not found ', async () => {
    await client.get(`${basePath}/unknown_id`).set('authorization', `Bearer ${token}`).expect(404);
  });

  it('gives status 200 when entity found', async () => {
    const res = await client
      .get(`${basePath}/${data.userTenantId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', testUser.id);
  });

  async function givenRepositories() {
    userTenantRepo = await app.getRepository(UserTenantRepository);
    userRepo = await app.getRepository(UserRepository);
    roleRepo = await app.getRepository(RoleRepository);
    tenantRepo = await app.getRepository(TenantRepository);
  }

  async function setupMockData() {
    const [user, user2] = await userRepo.createAll([
      new User({
        firstName: 'firstname1',
        username: 'user1',
        email: 'user1@xyz',
      }),
      new User({
        firstName: 'firstname2',
        username: 'user2',
        email: 'user2@xyz',
      }),
    ]);

    const role = await roleRepo.create(
      new Role({
        name: 'test_admin',
        roleType: 0 as unknown as undefined,
      }),
    );

    const key = nanoid(10);
    const tenant = await tenantRepo.create(
      new Tenant({
        name: tenantName,
        key: key,
        status: 1,
      }),
    );
    const userTenant = await userTenantRepo.create(
      new UserTenant({
        userId: user.id,
        tenantId: tenant.id,
        roleId: role.id,
      }),
      new UserTenant({
        userId: user2.id,
        tenantId: tenant.id,
        roleId: role.id,
      }),
    );

    testUser = {
      id: user.id,
      userTenantId: userTenant.id,
      username: user.username,
      tenantId: tenant.id,
      password: pass,
      permissions: [
        PermissionKey.ViewAnyUser,
        PermissionKey.ViewOwnUser,
        PermissionKey.ViewTenantUser,
        PermissionKey.ViewTenantUserRestricted,
      ],
    };
    if (testUser.userTenantId) {
      data.userTenantId = testUser.userTenantId;
    }
    setCurrentUser();
  }

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    app.bind(`services.${UserOperationsService.name}`).toClass(UserOperationsService);
    token = jwt.sign(testUser, JWT_SECRET, {
      expiresIn: 180000,
      issuer: JWT_ISSUER,
    });
  }
});
