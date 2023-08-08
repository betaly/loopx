import * as jwt from 'jsonwebtoken';

import {Client, expect} from '@loopback/testlab';

import {AuthenticationBindings} from '@bleco/authentication';

import {PermissionKey} from '../../enums';
import {UserGroupHelperService, UserGroupService} from '../../services';
import {UserTenantServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';
import {setupApplication} from './test-helper';

describe('UserGroups Controller', function () {
  let app: UserTenantServiceApplication;
  const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
  const basePath = '/user-groups';
  let client: Client;
  let token: string;
  const pass = 'test_password';
  const testUser = {
    id: id,
    userTenantId: id,
    username: 'test_user',
    tenantId: id,
    password: pass,
    permissions: [PermissionKey.ViewUserGroupList],
  };

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });

  beforeAll(setCurrentUser);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(`${basePath}`).expect(401);
    expect(response).to.have.property('error');
  });

  it('gives status 200 when token is passed ', async () => {
    await client.get(`${basePath}`).set('authorization', `Bearer ${token}`).expect(200);
  });

  it('gives userGroups Count when token is passed ', async () => {
    await client.get(`${basePath}/count`).set('authorization', `Bearer ${token}`).expect(200);
  });

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    app.bind('service.sfUserService').toClass(UserGroupService);
    app.bind('service.sfUserService1').toClass(UserGroupHelperService);
    token = jwt.sign(testUser, JWT_SECRET, {
      expiresIn: 180000,
      issuer: JWT_ISSUER,
    });
  }
});
