import {Client} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {Roles} from '@loopx/user-core';
import {buildApiFromController, ControllerApi} from 'loopback4-testlab';
import {PickProperties} from 'ts-essentials';

import {UserTenantPrefsController} from '../../controllers';
import {UserServiceApplication} from '../fixtures/application';
import {assertPermissions, buildAccessToken, setupApplication, SetupData, setupData} from './test-helper';

interface Operations extends Record<keyof PickProperties<UserTenantPrefsController, Function>, boolean> {
  //
}

describe('UserTenantPrefs Controller - acl', function () {
  let app: UserServiceApplication;
  let client: Client;
  let api: ControllerApi<UserTenantPrefsController>;

  let users: SetupData['users'];

  beforeEach(async () => {
    ({app, client} = await setupApplication());
    api = buildApiFromController(client, UserTenantPrefsController);
  });

  afterEach(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    ({users} = await setupData(app));
  });

  describe(Roles.SuperAdmin, () => {
    testPermissions(Roles.SuperAdmin, {
      create: true,
      find: true,
    });
  });

  describe(Roles.Owner, () => {
    testPermissions(Roles.Owner, {
      create: true,
      find: true,
    });
  });

  describe(Roles.Admin, () => {
    testPermissions(Roles.Admin, {
      create: true,
      find: true,
    });
  });

  describe(Roles.User, () => {
    testPermissions(Roles.User, {
      create: true,
      find: true,
    });
  });

  describe('anonymous', () => {
    testPermissions('anonymous', {
      create: false,
      find: false,
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

    it(`create returns ${permissions.create} for role ${role}`, async () => {
      const expectedStatus = permissions.create ? 204 : errorCode;

      await assertPermissions(
        api.create().send({configKey: 'language', configValue: {value: 'zh'}}),
        role,
        token,
        expectedStatus,
      );
    });

    it(`find returns ${permissions.find} for role ${role}`, async () => {
      const expectedStatus = permissions.find ? 200 : errorCode;

      await assertPermissions(api.find(), role, token, expectedStatus);
    });
  }
});
