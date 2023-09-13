import {PickProperties} from 'ts-essentials';
import {TenantUserController} from '../../controllers';
import {UserServiceApplication} from '../fixtures/application';
import {Client} from '@loopback/testlab';
import {buildApiFromController, ControllerApi} from 'loopback4-testlab';
import {Roles, Tenant} from '@loopx/user-core';
import {assertPermissions, buildAccessToken, setupApplication, setupData, SetupData} from './test-helper';
import {IAuthTenantUser} from '@loopx/core';

interface Operations extends Record<keyof PickProperties<TenantUserController, Function>, boolean> {
  //
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
    });
  });

  describe('anonymous', () => {
    testPermissions(null, {
      find: false,
      findAllUsers: false,
      findById: false,
      count: false,
      create: false,
      updateById: false,
      deleteById: false,
    });
  });

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
  }
});
