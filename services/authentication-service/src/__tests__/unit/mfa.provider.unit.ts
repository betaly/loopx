﻿import {expect} from '@loopback/testlab';
import sinon from 'sinon';

import {AuthUser} from '../../modules/auth';
import {MfaProvider} from '../../providers/mfa.provider';

describe('MFA Provider', () => {
  let mfaProvider: MfaProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('mfa provider', () => {
    it('checks if provider returns a function', async () => {
      const result = mfaProvider.value();
      expect(result).to.be.Function();
    });

    it('returns false as default value', async () => {
      const user = {
        permissions: ['*'],
        authClientId: 123,
        role: 'test_role',
        name: 'test_name',
        username: 'test_username',
        userTenantId: 'user_tenant_id',
        tenantId: 'tenant_id',
      };
      const func = mfaProvider.value();
      const result = await func(user as AuthUser);
      expect(result).to.be.eql(false);
    });
  });

  function setUp() {
    mfaProvider = new MfaProvider();
  }
});
