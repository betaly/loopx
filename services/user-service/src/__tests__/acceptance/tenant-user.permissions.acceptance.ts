import {Client} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {Roles, Tenant} from '@loopx/user-core';
import {buildApiFromController, ControllerApi} from 'loopback4-testlab';
import {PickProperties} from 'ts-essentials';

import {TenantUserController} from '../../controllers';
import {UserServiceApplication} from '../fixtures/application';
import {assertPermissions, buildAccessToken, setupApplication, SetupData, setupData} from './test-helper';

interface Operations extends Record<keyof PickProperties<TenantUserController, Function>, boolean> {
  create_AdminUser: boolean;
  create_OwnerUser: boolean;

  create_InOtherTenant: boolean;
  findById_InOtherTenant: boolean;
  deleteById_InOtherTenant: boolean;
  updateById_InOtherTenant: boolean;
}

describe('TenantUser Controller - acl', function () {
  let app: UserServiceApplication;
  let client: Client;
  let api: ControllerApi<TenantUserController>;

  let tenant: Tenant;
  let tenant2: Tenant;
  let users: SetupData['users'];

  beforeEach(async () => {
    ({app, client} = await setupApplication());
    api = buildApiFromController(client, TenantUserController);
  });

  afterEach(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    ({tenant1: tenant, tenant2, users} = await setupData(app));
  });

  describe(Roles.SuperAdmin, () => {
    testPermissions(Roles.SuperAdmin, {
      find: true,
      findAllUsers: true,
      findById: true,
      count: true,
      create: true,
      updateById: true,
      deleteById: true,
      create_AdminUser: true,
      create_OwnerUser: true,

      create_InOtherTenant: true,
      findById_InOtherTenant: true,
      deleteById_InOtherTenant: true,
      updateById_InOtherTenant: true,
    });
  });

  describe(Roles.Owner, () => {
    testPermissions(Roles.Owner, {
      find: true,
      findAllUsers: true,
      findById: true,
      count: true,
      create: true,
      updateById: true,
      deleteById: true,
      create_AdminUser: true,
      create_OwnerUser: true,

      create_InOtherTenant: false,
      findById_InOtherTenant: false,
      deleteById_InOtherTenant: false,
      updateById_InOtherTenant: false,
    });
  });

  describe(Roles.Admin, () => {
    testPermissions(Roles.Admin, {
      find: true,
      findAllUsers: true,
      findById: true,
      count: true,
      create: true,
      deleteById: false,
      updateById: true,
      create_AdminUser: false,
      create_OwnerUser: false,

      create_InOtherTenant: false,
      findById_InOtherTenant: false,
      deleteById_InOtherTenant: false,
      updateById_InOtherTenant: false,
    });
  });

  describe(Roles.User, () => {
    testPermissions(Roles.User, {
      find: true,
      findAllUsers: true,
      findById: true,
      count: true,
      create: false,
      deleteById: false,
      updateById: true,
      create_AdminUser: false,
      create_OwnerUser: false,

      create_InOtherTenant: false,
      findById_InOtherTenant: false,
      deleteById_InOtherTenant: false,
      updateById_InOtherTenant: false,
    });
  });

  describe('anonymous', () => {
    testPermissions('anonymous', {
      find: false,
      findAllUsers: false,
      findById: false,
      count: false,
      create: false,
      updateById: false,
      deleteById: false,
      create_AdminUser: false,
      create_OwnerUser: false,

      create_InOtherTenant: false,
      findById_InOtherTenant: false,
      deleteById_InOtherTenant: false,
      updateById_InOtherTenant: false,
    });
  });

  function testPermissions(role: Roles | 'anonymous', permissions: Operations) {
    const errorCode = role === 'anonymous' ? 401 : 403;

    let user: IAuthTenantUser | null;
    let token: string;

    beforeEach(async () => {
      if (role === 'anonymous') {
        user = null;
        token = '';
      } else {
        user = users[role]!;
        token = buildAccessToken(user);
      }
    });

    it(`find returns ${permissions.find} for role ${role}`, async () => {
      const expectedStatus = permissions.find ? 200 : errorCode;
      await assertPermissions(api.find({id: tenant.id}), role, token, expectedStatus);
    });

    it(`findAllUsers returns ${permissions.findAllUsers} for role ${role}`, async () => {
      const expectedStatus = permissions.findAllUsers ? 200 : errorCode;
      await assertPermissions(api.findAllUsers({id: tenant.id}), role, token, expectedStatus);
    });

    it(`findById returns ${permissions.findById} for role ${role}`, async () => {
      const expectedStatus = permissions.findById ? 200 : errorCode;
      await assertPermissions(
        api.findById({id: tenant.id, userId: user?.id ?? 'anonymous'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`count returns ${permissions.count} for role ${role}`, async () => {
      const expectedStatus = permissions.count ? 200 : errorCode;
      await assertPermissions(api.count({id: tenant.id}), role, token, expectedStatus);
    });

    it(`create "user" role tenant user returns ${permissions.create} for role ${role}`, async () => {
      const expectedStatus = permissions.create ? 200 : errorCode;
      await assertPermissions(
        api.create({id: tenant.id}).send({
          roleId: Roles.User,
          tenantId: tenant.id,
          userDetails: {
            username: 'test',
          },
        }),
        role,
        token,
        expectedStatus,
      );
    });

    it(`deleteById returns ${permissions.deleteById} for role ${role}`, async () => {
      const expectedStatus = permissions.deleteById ? 204 : errorCode;
      await assertPermissions(
        api.deleteById({id: tenant.id, userId: user?.id ?? 'anonymous'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`updateById returns ${permissions.updateById} for role ${role}`, async () => {
      const expectedStatus = permissions.updateById ? 204 : errorCode;
      await assertPermissions(
        api.updateById({id: tenant.id, userId: user?.id ?? 'anonymous'}).send({username: 'test-1'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`create "admin" role tenant user returns ${permissions.create_AdminUser} for role ${role}`, async () => {
      const expectedStatus = permissions.create_AdminUser ? 200 : errorCode;
      await assertPermissions(
        api.create({id: tenant.id}).send({
          roleId: Roles.Admin,
          tenantId: tenant.id,
          userDetails: {
            username: 'test',
          },
        }),
        role,
        token,
        expectedStatus,
      );
    });

    it(`create "owner" role tenant user returns ${permissions.create_OwnerUser} for role ${role}`, async () => {
      const expectedStatus = permissions.create_OwnerUser ? 200 : errorCode;
      await assertPermissions(
        api.create({id: tenant.id}).send({
          roleId: Roles.Owner,
          tenantId: tenant.id,
          userDetails: {
            username: 'test',
          },
        }),
        role,
        token,
        expectedStatus,
      );
    });

    it(`create_InOtherTenant returns ${permissions.create_InOtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.create_InOtherTenant ? 200 : errorCode;
      await assertPermissions(
        api.create({id: tenant2.id}).send({
          roleId: Roles.User,
          userDetails: {
            username: 'test',
          },
        }),
        role,
        token,
        expectedStatus,
      );
    });

    it(`findById_InOtherTenant returns ${permissions.findById_InOtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.findById_InOtherTenant ? 200 : errorCode;
      await assertPermissions(
        api.findById({id: tenant2.id, userId: user?.id ?? 'anonymous'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`deleteById_InOtherTenant returns ${permissions.deleteById_InOtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.deleteById_InOtherTenant ? 204 : errorCode;
      await assertPermissions(
        api.deleteById({id: tenant2.id, userId: user?.id ?? 'anonymous'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`updateById_InOtherTenant returns ${permissions.updateById_InOtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.updateById_InOtherTenant ? 204 : errorCode;
      await assertPermissions(
        api.updateById({id: tenant2.id, userId: user?.id ?? 'anonymous'}).send({name: 'test-2'}),
        role,
        token,
        expectedStatus,
      );
    });
  }
});
