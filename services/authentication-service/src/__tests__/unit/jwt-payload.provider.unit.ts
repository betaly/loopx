import {ClientType} from '@bleco/authentication';
import {createStubInstance, expect, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';
import {AuthErrors, NullLogger} from '@loopx/core';
import {
  RoleRepository,
  TenantConfigRepository,
  UserLevelPermissionRepository,
  UserTenantRepository,
} from '@loopx/user-core';
import sinon from 'sinon';

import {JwtPayloadProvider} from '../../providers';

describe('JWT Payload Provider', () => {
  let roleRepo: StubbedInstanceWithSinonAccessor<RoleRepository>;
  let userLevelPermissionRepo: StubbedInstanceWithSinonAccessor<UserLevelPermissionRepository>;
  let userTenantRepo: StubbedInstanceWithSinonAccessor<UserTenantRepository>;
  let tenantConfigRepo: StubbedInstanceWithSinonAccessor<TenantConfigRepository>;
  let jwtPayloadProvider: JwtPayloadProvider;

  const authUserData = {
    id: 'dummy',
    username: 'test_username',
    password: 'test_password',
  };

  const authClient = {
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    clientType: ClientType.public,
  };

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('jwt payload service', () => {
    it('checks if provider returns a function', async () => {
      const result = jwtPayloadProvider.value();
      expect(result).to.be.Function();
    });

    it('returns error if no user exist', async () => {
      const func = jwtPayloadProvider.value();
      const result = await func(authUserData, authClient).catch(err => err.message);
      expect(result).to.be.eql(AuthErrors.UserDoesNotExist.message);
    });
  });

  function setUp() {
    roleRepo = createStubInstance(RoleRepository);
    userLevelPermissionRepo = createStubInstance(UserLevelPermissionRepository);
    userTenantRepo = createStubInstance(UserTenantRepository);
    tenantConfigRepo = createStubInstance(TenantConfigRepository);
    jwtPayloadProvider = new JwtPayloadProvider(
      roleRepo,
      userLevelPermissionRepo,
      userTenantRepo,
      tenantConfigRepo,
      // userPermissions,
      new NullLogger(),
    );
  }
});
