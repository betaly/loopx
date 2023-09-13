import {Client} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {Roles} from '@loopx/user-core';
import {buildApiFromController, ControllerApi} from 'loopback4-testlab';
import {PickProperties} from 'ts-essentials';

import {UserTenantController} from '../../controllers';
import {UserServiceApplication} from '../fixtures/application';
import {assertPermissions, buildAccessToken, setupApplication, SetupData, setupData} from './test-helper';

interface Operations extends Record<keyof PickProperties<UserTenantController, Function>, boolean> {
  findById_OtherTenantUser: boolean;
}

describe('UserTenant Controller - acl', function () {
  let app: UserServiceApplication;
  let client: Client;
  let api: ControllerApi<UserTenantController>;

  let users: SetupData['users'];
  let otherTenantUser: IAuthTenantUser;

  beforeEach(async () => {
    ({app, client} = await setupApplication());
    api = buildApiFromController(client, UserTenantController);
  });

  afterEach(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    ({users, otherTenantUser} = await setupData(app));
  });

  describe(Roles.SuperAdmin, () => {
    testPermissions(Roles.SuperAdmin, {
      findById: true,
      findById_OtherTenantUser: true,
    });
  });

  describe(Roles.Owner, () => {
    testPermissions(Roles.Owner, {
      findById: true,
      findById_OtherTenantUser: false,
    });
  });

  describe(Roles.Admin, () => {
    testPermissions(Roles.Admin, {
      findById: true,
      findById_OtherTenantUser: false,
    });
  });

  describe(Roles.User, () => {
    testPermissions(Roles.User, {
      findById: true,
      findById_OtherTenantUser: false,
    });
  });

  describe('anonymous', () => {
    testPermissions('anonymous', {
      findById: false,
      findById_OtherTenantUser: false,
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

    it(`findById returns ${permissions.findById} for role ${role}`, async () => {
      const expectedStatus = permissions.findById ? 200 : errorCode;

      await assertPermissions(
        api.findById({id: role === 'anonymous' ? 'anonymous' : user!.userTenantId ?? '__invalid_user__'}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`findById returns ${permissions.findById_OtherTenantUser} for role ${role}`, async () => {
      const expectedStatus = permissions.findById_OtherTenantUser ? 200 : errorCode;

      await assertPermissions(
        api.findById({id: role === 'anonymous' ? 'anonymous' : otherTenantUser.userTenantId}),
        role,
        token,
        expectedStatus,
      );
    });
  }
});
