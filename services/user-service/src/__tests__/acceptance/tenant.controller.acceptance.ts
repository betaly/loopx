import {AuthenticationBindings} from '@bleco/authentication';
import {Client, expect} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import {Roles, Tenant, TenantRepository} from '@loopx/user-core';
import {uid} from 'uid';

import {UserServiceApplication} from '../fixtures/application';
import {buildAccessToken, setupApplication, toTenantUser} from './test-helper';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';

describe('Tenant Controller', function () {
  let app: UserServiceApplication;
  let tenantRepo: TenantRepository;
  const basePath = '/tenants';
  let client: Client;
  let token: string;
  const tenantName = 'sample_tenant';
  const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
  const testUser: IAuthTenantUser = toTenantUser({
    tenantId: id,
    role: Roles.Owner,
  });
  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });

  beforeAll(givenRepositories);
  beforeAll(setCurrentUser);

  it('gives status 401 when no token is passed', async () => {
    const response = await client.get(basePath).expect(401);
    expect(response).to.have.property('error');
  });

  it('find gives status 200 when token is passed ', async () => {
    const superadmin = toTenantUser({tenantId: DEFAULT_TENANT_CODE, role: Roles.SuperAdmin});
    const superadminToken = buildAccessToken(superadmin);
    await client.get(basePath).set('authorization', `Bearer ${superadminToken}`).expect(200);
  });

  it('create gives status 422 when request body is invalid', async () => {
    const tenant = {};
    await client.post(basePath).set('authorization', `Bearer ${token}`).send(tenant).expect(422);
  });

  it('create gives status 200 when a new tenant entity is created', async () => {
    const code = uid(10);
    const tenant = {
      name: tenantName,
      code,
    };
    await client.post(basePath).set('authorization', `Bearer ${token}`).send(tenant).expect(200);
  });

  it('deleteById gives status 204 when a tenant entity is deleted ', async () => {
    const code = uid(10);
    const tenant = await tenantRepo.create(
      new Tenant({
        name: tenantName,
        code,
        status: 1,
      }),
    );
    const tenantOwner = toTenantUser({tenantId: tenant.id, role: Roles.Owner});
    const tenantOwnerToken = buildAccessToken(tenantOwner);
    await client.del(`${basePath}/${tenant.id}`).set('authorization', `Bearer ${tenantOwnerToken}`).expect(204);
  });

  it('return a tenant objet when id is sent', async () => {
    const code = uid(10);
    const tenant = await tenantRepo.create(
      new Tenant({
        name: tenantName,
        code,
        status: 1,
      }),
    );
    const tenantOwner = toTenantUser({tenantId: tenant.id, role: Roles.Owner});
    const tenantOwnerToken = buildAccessToken(tenantOwner);
    const response = await client
      .get(`${basePath}/${tenant.id}`)
      .set('authorization', `Bearer ${tenantOwnerToken}`)
      .expect(200);
    expect(response.body).to.have.properties(['name']);
  });

  it('gives status 204 when a task is updated ', async () => {
    const code = uid(10);
    const tenant = await tenantRepo.create(
      new Tenant({
        name: tenantName,
        code,
        status: 1,
      }),
    );
    const tenantOwner = toTenantUser({tenantId: tenant.id, role: Roles.Owner});
    const tenantOwnerToken = buildAccessToken(tenantOwner);
    await client
      .patch(`${basePath}/${tenant.id}`)
      .set('authorization', `Bearer ${tenantOwnerToken}`)
      .send({name: 'new tenant'})
      .expect(204);
  });

  it('gives count of the number of tenant entities ', async () => {
    const superadmin = toTenantUser({tenantId: DEFAULT_TENANT_CODE, role: Roles.SuperAdmin});
    const superadminToken = buildAccessToken(superadmin);
    const countResponse = await client.get(`${basePath}/count`).set('authorization', `Bearer ${superadminToken}`);
    expect(countResponse.body).to.have.property('count');
  });

  it('gives status 403 when user doesnt have the required permissions', async () => {
    const code = uid(10);
    const newTestUserId = '9640864d-a84a-e6b4-f20e-918ff280cdbb';
    const newTestUser: IAuthTenantUser = toTenantUser({
      tenantId: newTestUserId,
      role: Roles.Guest,
    });

    const newToken = buildAccessToken(newTestUser);
    await client
      .post(basePath)
      .send({
        name: tenantName,
        code: code,
      })
      .set('authorization', `Bearer ${newToken}`)
      .expect(403);
  });

  async function givenRepositories() {
    tenantRepo = await app.getRepository(TenantRepository);
  }

  function setCurrentUser() {
    app.bind(AuthenticationBindings.CURRENT_USER).to(testUser);
    token = buildAccessToken(testUser);
  }
});
