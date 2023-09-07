import {IAuthTenantUser, UserStatus} from '@loopx/core';
import {Able} from 'loopback4-acl';

import {RoleKey} from '../../enums';
import {Tenant, User, UserDto} from '../../models';
import {permissions} from '../../permissions';
import {
  AuthSecureClientRepository,
  RoleRepository,
  TenantRepository,
  UserGroupRepository,
  UserRepository,
  UserTenantRepository,
} from '../../repositories';
import {UserOperationsService} from '../../services';
import {UserTenantApplication} from '../fixtures/application';
import {seed, SeedResult} from '../fixtures/seed';
import {defineAble} from '../supports';
import {setupApplication} from './helpers';

describe('UserOperationsService', () => {
  let app: UserTenantApplication;

  let tenantRepo: TenantRepository;
  let userRepo: UserRepository;
  let utRepo: UserTenantRepository;
  let roleRepo: RoleRepository;
  let authClientRepo: AuthSecureClientRepository;
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
          new UserDto({
            tenantId: tenant.id,
            roleId: RoleKey.Member,
            details: new User({
              username: 'username',
            }),
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: RoleKey.Member,
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          details: {
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
          new UserDto({
            tenantId: tenant.id,
            roleId: RoleKey.Member,
            details: new User({
              username: 'username',
            }),
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: RoleKey.Member,
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          details: {
            username: 'username',
          },
        });
      });

      it('creates a user with auth provider', async () => {
        const user = await userOpsService.create(
          new UserDto({
            tenantId: tenant.id,
            roleId: RoleKey.Member,
            authProvider: 'auth-provider',
            authId: 'auth-id',
            details: new User({
              username: 'username',
            }),
          }),
          null,
        );
        expect(user).toMatchObject({
          tenantId: tenant.id,
          roleId: RoleKey.Member,
          authProvider: 'auth-provider',
          status: UserStatus.REGISTERED,
          userTenantId: expect.any(String),
          details: {
            username: 'username',
          },
        });

        const creds = await userRepo.credentials(user.details.id).get();
        expect(creds).toMatchObject({
          authProvider: 'auth-provider',
          authId: 'auth-id',
        });
      });

      it('throws error if user already exists', async () => {
        const dto = new UserDto({
          tenantId: tenant.id,
          roleId: RoleKey.Member,
          details: new User({
            username: 'username',
          }),
        });
        await userOpsService.create(dto, null);
        await expect(userOpsService.create(dto, null)).rejects.toThrow(/User already exists/);
      });

      it('throws error if user already exists with same auth provider and auth id', async () => {
        const dto = new UserDto({
          tenantId: tenant.id,
          roleId: RoleKey.Member,
          authProvider: 'auth-provider',
          authId: 'auth-id',
          details: new User({
            username: 'username',
          }),
        });
        await userOpsService.create(dto, null);
        await expect(userOpsService.create(dto, null)).rejects.toThrow(/User already exists/);
      });
    });

    describe('acl - tenant rule', () => {
      it('can not perform any action in different tenant', async () => {
        const able = await defineAble(users.owner.details, userTenants.owner, permissions);
        await expect(
          userOpsService.create(
            new UserDto({
              tenantId: 'different-tenant',
              roleId: RoleKey.Member,
              details: new User({
                username: 'username',
              }),
            }),
            able,
          ),
        ).rejects.toThrow(/Not allowed access/);
      });
    });

    describe('acl - roles rule', () => {
      it('null able - can create any role user', async () => {
        await assertCreate(null, RoleKey.Member, true);
        await assertCreate(null, RoleKey.Admin, true);
        await assertCreate(null, RoleKey.Owner, true);
      });

      it('member - cant not create any role user', async () => {
        const able = await defineAble(users.member.details, userTenants.member, permissions);
        await assertCreate(able, RoleKey.Member, false);
        await assertCreate(able, RoleKey.Admin, false);
        await assertCreate(able, RoleKey.Owner, false);
      });

      it('admin - can create member and admin role user and can not create owner', async () => {
        const able = await defineAble(users.admin.details, userTenants.admin, permissions);
        await assertCreate(null, RoleKey.Member, true);
        await assertCreate(null, RoleKey.Admin, true);
        await assertCreate(able, RoleKey.Owner, false);
      });

      it('owner - can create any role user', async () => {
        const able = await defineAble(users.owner.details, userTenants.owner, permissions);
        await assertCreate(able, RoleKey.Member, true);
        await assertCreate(able, RoleKey.Admin, true);
        await assertCreate(able, RoleKey.Owner, true);
      });

      async function assertCreate(able: Able<IAuthTenantUser> | null, role: RoleKey, expectSuccess: boolean) {
        const username = `username-${role}`;
        const dto = new UserDto({
          tenantId: tenant.id,
          roleId: role,
          details: new User({
            username,
          }),
        });
        if (expectSuccess) {
          expect(await userOpsService.create(dto, able)).toMatchObject({
            tenantId: tenant.id,
            roleId: role,
            status: UserStatus.REGISTERED,
            userTenantId: expect.any(String),
            details: {
              username,
            },
          });
        } else {
          await expect(userOpsService.create(dto, able)).rejects.toThrow(/Not allowed access/);
        }
      }
    });
  });

  async function givenRepositoriesAndServices() {
    tenantRepo = await app.getRepository(TenantRepository);
    userRepo = await app.getRepository(UserRepository);
    utRepo = await app.getRepository(UserTenantRepository);
    roleRepo = await app.getRepository(RoleRepository);
    authClientRepo = await app.getRepository(AuthSecureClientRepository);
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
