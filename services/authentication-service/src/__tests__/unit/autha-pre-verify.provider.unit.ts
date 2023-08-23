import * as AuthaStrategy from '@authajs/passport-autha';
import {expect} from '@loopback/testlab';
import sinon from 'sinon';

import {AuthaPreVerifyProvider} from '../../providers';

describe('Autha Pre Verify Service', () => {
  let googlePreVerifyProvider: AuthaPreVerifyProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  const accessToken = 'test_access_token';
  const refreshToken = 'test_refresh_token';
  const profile: AuthaStrategy.Profile = {
    id: 'test_id',
    name: 'test_name',
    avatar: 'test_avatar_url',
    provider: {
      name: 'test_provider',
      id: 'test_provider_id',
    },
    claims: {
      iss: 'test',
      aud: 'test',
      sub: 'test',
      iat: 1353601026,
      exp: 1353601026,
    },
  };
  const user = null;

  describe('Pre Verify Service', () => {
    it('checks if provider returns a function', async () => {
      const result = googlePreVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider function returns a promise which is eql to user', async () => {
      const func = googlePreVerifyProvider.value();
      const result = await func(accessToken, refreshToken, profile, user);
      expect(result).to.be.eql(user);
    });
  });

  function setUp() {
    googlePreVerifyProvider = new AuthaPreVerifyProvider();
  }
});
