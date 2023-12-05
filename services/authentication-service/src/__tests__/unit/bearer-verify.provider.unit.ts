import {expect} from '@loopback/testlab';
import {NullLogger} from '@loopx/core';
import sinon from 'sinon';

import {SignupBearerVerifyProvider} from '../../providers';

describe('Bearer Verify Signup Service', () => {
  let bearerVerifyProvider: SignupBearerVerifyProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  const token = 'test_token';

  describe('Bearer Verify Service', () => {
    it('checks if provider returns a function', async () => {
      const result = bearerVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('chexk if provider funtion throws error for token expiration', async () => {
      const func = bearerVerifyProvider.value();
      const result = await func(token).catch(err => err.message);
      expect(result).to.be.eql('TokenExpired');
    });
  });

  function setUp() {
    bearerVerifyProvider = new SignupBearerVerifyProvider(new NullLogger());
  }
});
