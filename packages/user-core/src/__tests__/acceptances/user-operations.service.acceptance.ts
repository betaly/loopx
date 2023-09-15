import {IAuthTenantUser, UserStatus} from '@loopx/core';
import {Able} from 'loopback4-acl';

import {DefaultRole} from '../../enums';
import {Tenant, TenantUserData} from '../../models';
import {
  AuthClientRepository,
  RoleRepository,
  TenantRepository,
  UserGroupRepository,
  UserRepository,
  UserTenantRepository,
} from '../../repositories';
import {UserOperationsService} from '../../services';
import {UserCoreApplication} from '../fixtures/application';
import {permissions} from '../fixtures/permissions';
import {seed, SeedResult} from '../fixtures/seed';
import {defineAble} from '../supports';
import {setupApplication} from '../helpers';

describe('UserOperationsService', () => {
  let app: UserCoreApplication;

  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let utRepo: UserTenantRepository;
  let roleRepo: RoleRepository;
  let authClientRepo: AuthClientRepository;
  let userGroupRepo: UserGroupRepository;

  let userOpsService: UserOperationsService;

  let tenant: Tenant;
  // let roles: SeedResult['roles'];
  let users: SeedResult['users'];
  let userTenants: SeedResult['userTenants'];

  beforeAll(async () => {
    app = await setupApplication();
  });
  beforeAll(givenRepositoriesAndServices);

  afterAll(async () => {
    await app.stop();
  });

  beforeEach(seedData);
  afterEach(clearData);

  describe('basics', () => {
    describe('create user', () => {
      it('creates a user', async () => {
        const user = await userOpsService.create(
          new TenantUserData({
            tenantId: tenant.id,
            roleId: DefaultRole.User,
            userDetails: {username: 'username'},
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: DefaultRole.User,
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          userDetails: {
            username: 'username',
          },
        });
      });
    });
  });

  describe('no "able" has super privilege', () => {
    //
  });

  describe('create', () => {
    describe('basics', () => {
      it('creates a user', async () => {
        const user = await userOpsService.create(
          new TenantUserData({
            tenantId: tenant.id,
            roleId: DefaultRole.User,
            userDetails: {username: 'username'},
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: DefaultRole.User,
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          userDetails: {
            username: 'username',
          },
        });
      });

      it('creates a user with auth provider', async () => {
        const user = await userOpsService.create(
          new TenantUserData({
            tenantId: tenant.id,
            roleId: DefaultRole.User,
            authProvider: 'auth-provider',
            authId: 'auth-id',
            userDetails: {username: 'username'},
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: DefaultRole.User,
          authProvider: 'auth-provider',
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          userDetails: {
            username: 'username',
          },
        });

        const creds = await userRepo.credentials(user.userDetails.id).get();
        expect(creds).toMatchObject({
          authProvider: 'auth-provider',
          authId: 'auth-id',
        });
      });

      it('throws error if user already exists', async () => {
        const data = new TenantUserData({
          tenantId: tenant.id,
          roleId: DefaultRole.User,
          userDetails: {username: 'username'},
        });
        await userOpsService.create(data, null);
        await expect(userOpsService.create(data, null)).rejects.toThrow(/User already exists/);
      });

      it('throws error if user already exists with same auth provider and auth id', async () => {
        const data = new TenantUserData({
          tenantId: tenant.id,
          roleId: DefaultRole.User,
          userDetails: {username: 'username'},
        });
        await userOpsService.create(data, null);
        await expect(userOpsService.create(data, null)).rejects.toThrow(/User already exists/);
      });
    });

    describe('acl - tenant rule', () => {
      it('can not perform any action in different tenant', async () => {
        const able = await defineAble(users.owner.userDetails, userTenants.owner, permissions);
        await expect(
          userOpsService.create(
            new TenantUserData({
              tenantId: 'different-tenant',
              roleId: DefaultRole.User,
              userDetails: {username: 'username'},
            }),
            able,
          ),
        ).rejects.toThrow(/Not allowed access/);
      });
    });

    describe('acl - roles rule', () => {
      it('null able - can create any role user', async () => {
        await assertCreate(null, DefaultRole.User, true);
        await assertCreate(null, DefaultRole.Admin, true);
        await assertCreate(null, DefaultRole.Owner, true);
      });

      it('user - cant not create any role user', async () => {
        const able = await defineAble(users.user.userDetails, userTenants.user, permissions);
        await assertCreate(able, DefaultRole.User, false);
        await assertCreate(able, DefaultRole.Admin, false);
        await assertCreate(able, DefaultRole.Owner, false);
      });

      it('admin - can create user and admin role user and can not create owner', async () => {
        const able = await defineAble(users.admin.userDetails, userTenants.admin, permissions);
        await assertCreate(null, DefaultRole.User, true);
        await assertCreate(null, DefaultRole.Admin, true);
        await assertCreate(able, DefaultRole.Owner, false);
      });

      it('owner - can create any role user', async () => {
        const able = await defineAble(users.owner.userDetails, userTenants.owner, permissions);
        await assertCreate(able, DefaultRole.User, true);
        await assertCreate(able, DefaultRole.Admin, true);
        await assertCreate(able, DefaultRole.Owner, true);
      });

      async function assertCreate(able: Able<IAuthTenantUser> | null, role: DefaultRole, expectSuccess: boolean) {
        const username = `username-${role}`;
        const data = new TenantUserData({
          tenantId: tenant.id,
          roleId: role,
          userDetails: {username},
        });
        if (expectSuccess) {
          expect(await userOpsService.create(data, able)).toMatchObject({
            tenantId: tenant.id,
            roleId: role,
            status: UserStatus.REGISTERED,
            userTenantId: expect.any(String),
            userDetails: {
              username,
            },
          });
        } else {
          await expect(userOpsService.create(data, able)).rejects.toThrow(/Not allowed access/);
        }
      }
    });
  });

  async function givenRepositoriesAndServices() {
    tenantRepo = await app.getRepository(TenantRepository);
    userRepo = await app.getRepository(UserRepository);
    utRepo = await app.getRepository(UserTenantRepository);
    roleRepo = await app.getRepository(RoleRepository);
    authClientRepo = await app.getRepository(AuthClientRepository);
    userGroupRepo = await app.getRepository(UserGroupRepository);

    userOpsService = await app.getService(UserOperationsService);
  }

  async function seedData() {
    ({tenant, users, userTenants} = await seed(app));
  }

  async function clearData() {
    await tenantRepo.deleteAllHard();
    await userRepo.deleteAllHard();
    await utRepo.deleteAllHard();
    await roleRepo.deleteAllHard();
    await userGroupRepo.deleteAllHard();
    await authClientRepo.deleteAll();
  }
});
