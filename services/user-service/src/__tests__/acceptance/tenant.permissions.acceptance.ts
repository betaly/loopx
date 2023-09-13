import {Client} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {Roles, Tenant} from '@loopx/user-core';
import {buildApiFromController, ControllerApi} from 'loopback4-testlab';
import {PickProperties} from 'ts-essentials';

import {TenantController} from '../../controllers';
import {UserServiceApplication} from '../fixtures/application';
import {assertPermissions, buildAccessToken, setupApplication, SetupData, setupData} from './test-helper';

interface Operations extends Record<keyof PickProperties<TenantController, Function>, boolean> {
  findById_OtherTenant: boolean;
  deleteById_OtherTenant: boolean;
  updateById_OtherTenant: boolean;
  getTenantConfig_OtherTenant: boolean;
}

describe('Tenant Controller - acl', function () {
  let app: UserServiceApplication;
  let client: Client;
  let api: ControllerApi<TenantController>;

  let tenant: Tenant;
  let tenant2: Tenant;
  let users: SetupData['users'];

  beforeEach(async () => {
    ({app, client} = await setupApplication());
    api = buildApiFromController(client, TenantController);
  });

  afterEach(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    ({tenant1: tenant, tenant2, users} = await setupData(app));
  });

  describe('super admin', () => {
    testPermissions(Roles.SuperAdmin, {
      find: true,
      findById: true,
      count: true,
      create: true,
      deleteById: true,
      updateAll: true,
      updateById: true,
      getTenantConfig: true,
      findById_OtherTenant: true,
      deleteById_OtherTenant: true,
      updateById_OtherTenant: true,
      getTenantConfig_OtherTenant: true,
    });
  });

  describe('owner', () => {
    testPermissions(Roles.Owner, {
      find: true,
      findById: true,
      count: true,
      create: true,
      deleteById: true,
      updateAll: false,
      updateById: true,
      getTenantConfig: true,
      findById_OtherTenant: false,
      deleteById_OtherTenant: false,
      updateById_OtherTenant: false,
      getTenantConfig_OtherTenant: false,
    });
  });

  describe('admin', () => {
    testPermissions(Roles.Admin, {
      find: true,
      findById: true,
      count: true,
      create: true,
      deleteById: false,
      updateAll: false,
      updateById: true,
      getTenantConfig: true,
      findById_OtherTenant: false,
      deleteById_OtherTenant: false,
      updateById_OtherTenant: false,
      getTenantConfig_OtherTenant: false,
    });
  });

  describe('user', () => {
    testPermissions(Roles.User, {
      find: true,
      findById: true,
      count: true,
      create: true,
      deleteById: false,
      updateAll: false,
      updateById: false,
      getTenantConfig: true,
      findById_OtherTenant: false,
      deleteById_OtherTenant: false,
      updateById_OtherTenant: false,
      getTenantConfig_OtherTenant: false,
    });
  });

  describe('anonymous', () => {
    testPermissions(null, {
      find: false,
      findById: false,
      count: false,
      create: false,
      deleteById: false,
      updateAll: false,
      updateById: false,
      getTenantConfig: false,
      findById_OtherTenant: false,
      deleteById_OtherTenant: false,
      updateById_OtherTenant: false,
      getTenantConfig_OtherTenant: false,
    });
  });

  /**
   * Test a role's permission when visit the endpoints in the tenant controller
   *
   * @param role - role of the user. If null, it means anonymous user.
   * @param permissions
   */
  function testPermissions(role: Roles | null, permissions: Operations) {
    const errorCode = role ? 403 : 401;

    let user: IAuthTenantUser | null;
    let token: string;

    beforeEach(async () => {
      if (role) {
        user = users[role]!;
        token = buildAccessToken(user);
      } else {
        user = null;
        token = '';
      }
    });

    it(`find returns ${permissions.find} for role ${role}`, async () => {
      const expectedStatus = permissions.find ? 200 : errorCode;
      await assertPermissions(api.find(), role, token, expectedStatus);
    });

    it(`findById returns ${permissions.findById} for role ${role}`, async () => {
      const expectedStatus = permissions.findById ? 200 : errorCode;
      await assertPermissions(api.findById({id: tenant.id}), role, token, expectedStatus);
    });

    it(`count returns ${permissions.count} for role ${role}`, async () => {
      const expectedStatus = permissions.count ? 200 : errorCode;
      await assertPermissions(api.count(), role, token, expectedStatus);
    });

    it(`create returns ${permissions.create} for role ${role}`, async () => {
      const expectedStatus = permissions.create ? 200 : errorCode;
      await assertPermissions(
        api.create().send({
          name: 'test',
        }),
        role,
        token,
        expectedStatus,
      );
    });

    it(`deleteById returns ${permissions.deleteById} for role ${role}`, async () => {
      const expectedStatus = permissions.deleteById ? 204 : errorCode;
      await assertPermissions(api.deleteById({id: tenant.id}), role, token, expectedStatus);
    });

    it(`updateAll returns ${permissions.updateAll} for role ${role}`, async () => {
      const expectedStatus = permissions.updateAll ? 200 : errorCode;
      await assertPermissions(api.updateAll().send({name: 'test-1'}), role, token, expectedStatus);
    });

    it(`updateById returns ${permissions.updateById} for role ${role}`, async () => {
      const expectedStatus = permissions.updateById ? 204 : errorCode;
      await assertPermissions(api.updateById({id: tenant.id}).send({name: 'test-1'}), role, token, expectedStatus);
    });

    it(`getTenantConfig returns ${permissions.getTenantConfig} for role ${role}`, async () => {
      const expectedStatus = permissions.getTenantConfig ? 200 : errorCode;
      await assertPermissions(api.getTenantConfig({id: tenant.id}), role, token, expectedStatus);
    });

    it(`findById_OtherTenant returns ${permissions.findById_OtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.findById_OtherTenant ? 200 : errorCode;
      await assertPermissions(api.findById({id: tenant2.id}), role, token, expectedStatus);
    });

    it(`deleteById_OtherTenant returns ${permissions.deleteById_OtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.deleteById_OtherTenant ? 204 : errorCode;
      await assertPermissions(api.deleteById({id: tenant2.id}), role, token, expectedStatus);
    });

    it(`updateById_OtherTenant returns ${permissions.updateById_OtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.updateById_OtherTenant ? 204 : errorCode;
      await assertPermissions(api.updateById({id: tenant2.id}).send({name: 'test-2'}), role, token, expectedStatus);
    });

    it(`getTenantConfig_OtherTenant returns ${permissions.getTenantConfig_OtherTenant} for role ${role}`, async () => {
      const expectedStatus = permissions.getTenantConfig_OtherTenant ? 200 : errorCode;
      await assertPermissions(api.getTenantConfig({id: tenant2.id}), role, token, expectedStatus);
    });
  }
});
