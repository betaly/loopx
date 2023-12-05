import {createStubInstance, expect, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';
import sinon from 'sinon';

import {JWTSymmetricVerifierProvider} from '../../..';
import {AuthUser} from '../../../modules/auth';
import {BearerTokenVerifyProvider} from '../../../modules/auth/providers/bearer-token-verify.provider';
import {RevokedTokenRepository} from '../../../repositories';
import {NullLogger} from '@loopx/core';

describe('Bearer Token Verify Provider', () => {
  let revokedTokenRepo: StubbedInstanceWithSinonAccessor<RevokedTokenRepository>;
  let bearerTokenVerifyProvider: BearerTokenVerifyProvider;

  const token = 'test_token';

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('Bearer Token Verifier', () => {
    it('checks if provider returns a function', async () => {
      const result = bearerTokenVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('return token expiry for expired token', async () => {
      const func = bearerTokenVerifyProvider.value();
      const result = await func(token).catch(err => err.message);
      expect(result).to.be.eql('TokenExpired');
    });
  });

  function setUp() {
    revokedTokenRepo = createStubInstance(RevokedTokenRepository);
    bearerTokenVerifyProvider = new BearerTokenVerifyProvider(
      revokedTokenRepo,
      new NullLogger(),
      new JWTSymmetricVerifierProvider<AuthUser>().value(),
    );
  }
});
