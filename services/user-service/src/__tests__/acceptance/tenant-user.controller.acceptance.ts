import {AuthenticationBindings} from '@bleco/authentication';
import {DataObject} from '@loopback/repository';
import {Client, expect} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {TENANT_HEADER_NAME} from '@loopx/multi-tenancy';
import {DefaultRole, UserDto, UserOperationsService} from '@loopx/user-core';

import {UserServiceApplication} from '../fixtures/application';
import {buildAccessToken, createTenantUser, setupApplication} from './test-helper';

describe('TenantUser Controller', function () {
  let app: UserServiceApplication;
  const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
  let client: Client;
  let token: string;
  const testUser: IAuthTenantUser = createTenantUser({
    tenantId: id,
    role: DefaultRole.Owner,
  });

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });
  beforeAll(setCurrentUser);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(`/tenants/${id}/users`).expect(401);
    expect(response).to.have.property('error');
  });

  it('gives status 200 when token is passed ', async () => {
    await client
      .get(`/tenants/${id}/users`)
      // .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('gives view-all when token is passed ', async () => {
    await client
      .get(`/tenants/${id}/users/view-all`)
      // .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('gives count when token is passed ', async () => {
    await client
      .get(`/tenants/${id}/users/count`)
      // .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('when user details is not present and token is passed gives 404', async () => {
    await client
      .get(`/tenants/${id}/users/${id}`)
      // .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('gives status 404 when entity not found', async () => {
    const newUser: DataObject<UserDto> = {
      roleId: '1',
      userTenantId: '1',
      tenantId: '1',
      details: {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'test_user',
      },
    };
    await client
      .post(`/tenants/${id}/users`)
      .set(TENANT_HEADER_NAME, id)
      .set('authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(404);
  });

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    // app.bind(MultiTenancyBindings.CURRENT_TENANT).to({id});
    app.bind('services.UserOperationsService').toClass(UserOperationsService);
    token = buildAccessToken(testUser);
  }
});
