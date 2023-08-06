import sinon from 'sinon';

import {StubbedInstanceWithSinonAccessor, createStubInstance, expect} from '@loopback/testlab';

import {ClientType} from '@bleco/authentication';
import {UserPermission} from '@bleco/authorization';

import {AuthErrors} from '@loopx/core';

import {JwtPayloadProvider} from '../../providers';
import {
  RoleRepository,
  TenantConfigRepository,
  UserLevelPermissionRepository,
  UserTenantRepository,
} from '../../repositories';

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

  const logger = {
    log,
    info,
    warn,
    error,
    debug,
  };

  const userPermissions = (userPrm: UserPermission<string>[], rolePrm: string[]) => ['dummy'];

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

  function log() {
    // This is intentional
  }

  function info() {
    // This is intentional
  }

  function warn() {
    // This is intentional
  }

  function error() {
    // This is intentional
  }

  function debug() {
    // This is intentional
  }

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
      userPermissions,
      logger,
    );
  }
});
