import * as AuthaStrategy from '@authajs/passport-autha';
import {expect} from '@loopback/testlab';
import sinon from 'sinon';

import {AuthaSignupProvider} from '../../providers';

describe('Autha Signup Service', () => {
  let authaSignupProvider: AuthaSignupProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

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

  describe('Signup Service', () => {
    it('checks if provider returns a function', async () => {
      const result = authaSignupProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider function returns a promise and throws not implemented', async () => {
      const func = authaSignupProvider.value();
      const result = await func(profile).catch(err => err.message);
      expect(result).to.be.eql('AuthaSignupProvider not implemented');
    });
  });

  function setUp() {
    authaSignupProvider = new AuthaSignupProvider();
  }
});
