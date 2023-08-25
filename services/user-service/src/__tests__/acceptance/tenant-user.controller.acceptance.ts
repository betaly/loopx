import {AuthenticationBindings} from '@bleco/authentication';
import {Client, expect} from '@loopback/testlab';
import {TENANT_HEADER_NAME} from '@loopx/multi-tenancy';
import * as jwt from 'jsonwebtoken';

import {PermissionKey} from '../../enums';
import {UserOperationsService} from '../../services';
import {UserTenantServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';
import {setupApplication} from './test-helper';

describe('TenantUser Controller', function () {
  let app: UserTenantServiceApplication;
  const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
  let client: Client;
  let token: string;
  const pass = 'test_password';
  const testUser = {
    id: id,
    userTenantId: id,
    username: 'test_user',
    tenantId: id,
    password: pass,
    roleId: id,
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
      PermissionKey.ViewOwnUser,
      PermissionKey.CreateAnyUser,
      PermissionKey.CreateTenantUser,
      PermissionKey.CreateTenantUserRestricted,
      PermissionKey.UpdateAnyUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.UpdateTenantUser,
      PermissionKey.UpdateTenantUserRestricted,
      PermissionKey.DeleteAnyUser,
      PermissionKey.DeleteTenantUser,
      PermissionKey.DeleteTenantUserRestricted,
      PermissionKey.ViewAllUser,
    ],
  };

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });
  beforeAll(setCurrentUser);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(`/users`).expect(400);
    expect(response).to.have.property('error');
  });

  it('gives status 200 when token is passed ', async () => {
    await client.get(`/users`).set(TENANT_HEADER_NAME, id).set('authorization', `Bearer ${token}`).expect(200);
  });

  it('gives view-all when token is passed ', async () => {
    await client.get(`/users/view-all`).set(TENANT_HEADER_NAME, id).set('authorization', `Bearer ${token}`).expect(200);
  });

  it('gives count when token is passed ', async () => {
    await client.get(`/users/count`).set(TENANT_HEADER_NAME, id).set('authorization', `Bearer ${token}`).expect(200);
  });

  it('when user details is not present and token is passed gives 404', async () => {
    await client.get(`/users/${id}`).set(TENANT_HEADER_NAME, id).set('authorization', `Bearer ${token}`).expect(404);
  });

  it('gives status 404 when entity not found', async () => {
    const newUser = {
      roleId: '1',
      userTenantId: '1',
      tenantId: '1',
      userDetails: {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'test_user',
      },
    };
    await client
      .post(`/users`)
      .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(404);
  });

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    // app.bind(MultiTenancyBindings.CURRENT_TENANT).to({id});
    app.bind('services.UserOperationsService').toClass(UserOperationsService);
    token = jwt.sign(testUser, JWT_SECRET, {
      expiresIn: 180000,
      issuer: JWT_ISSUER,
    });
  }
});
