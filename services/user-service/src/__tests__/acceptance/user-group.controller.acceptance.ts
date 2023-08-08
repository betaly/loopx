import * as jwt from 'jsonwebtoken';

import {Client, expect} from '@loopback/testlab';

import {AuthenticationBindings} from '@bleco/authentication';

import {PermissionKey} from '../../enums';
import {UserGroup} from '../../models';
import {UserGroupRepository} from '../../repositories';
import {UserGroupHelperService, UserGroupService} from '../../services';
import {UserTenantServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';
import {setupApplication} from './test-helper';

describe('UserGroup Controller', function () {
  let app: UserTenantServiceApplication;
  let userGroupRepo: UserGroupRepository;
  const id = '9640864d-a84a-e6b4-f20e-918ff280cdaa';
  const basePath = '/groups';
  let client: Client;
  let token: string;
  const pass = 'test_password';
  const testUser = {
    id: id,
    userTenantId: id,
    username: 'test_user',
    tenantId: id,
    password: pass,
    permissions: [
      PermissionKey.ViewUserGroupList,
      PermissionKey.UpdateMemberInUserGroup,
      PermissionKey.RemoveMemberFromUserGroup,
      PermissionKey.LeaveUserGroup,
      PermissionKey.AddMemberToUserGroup,
    ],
  };

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });
  beforeAll(givenRepositories);
  beforeAll(setCurrentUser);

  it('gives status 401 when no token is passed', async () => {
    const userGroup = await userGroupRepo.create(
      new UserGroup({
        groupId: '3',
        userTenantId: id,
      }),
    );
    const response = await client.get(`${basePath}/${userGroup.groupId}/user-groups`).expect(401);
    expect(response).to.have.property('error');
  });

  it('gives status 200 when token is passed ', async () => {
    const userGroup = await userGroupRepo.create(
      new UserGroup({
        groupId: '3',
        userTenantId: id,
      }),
    );
    await client
      .get(`${basePath}/${userGroup.groupId}/user-groups`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('gives status 422 when request body is invalid', async () => {
    const userGroup = await userGroupRepo.create(
      new UserGroup({
        groupId: '3',
        userTenantId: id,
      }),
    );
    await client
      .post(`${basePath}/${userGroup.groupId}/user-groups`)
      .set('authorization', `Bearer ${token}`)
      .send(userGroup)
      .expect(422);
  });

  it('gives status 200 when a new usergroup is created', async () => {
    const userGroup = await userGroupRepo.create(
      new UserGroup({
        groupId: '3',
        userTenantId: id,
      }),
    );
    const payload = userGroup;
    delete payload.id;
    await client
      .post(`${basePath}/${userGroup.groupId}/user-groups`)
      .set('authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);
  });

  async function givenRepositories() {
    userGroupRepo = await app.getRepository(UserGroupRepository);
  }

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
