import * as AuthaStrategy from '@authajs/passport-autha';
import {expect} from '@loopback/testlab';
import sinon from 'sinon';

import {AuthaPostVerifyProvider} from '../../providers';

describe('Autha Post Verify Service', () => {
  let authaPostVerifyProvider: AuthaPostVerifyProvider;

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
  const user = null;

  describe('Post Verify Service', () => {
    it('checks if provider returns a function', async () => {
      const result = authaPostVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider function returns a promise which returns the user', async () => {
      const func = authaPostVerifyProvider.value();
      const result = await func(profile, user);
      expect(result).to.be.eql(user);
    });
  });

  function setUp() {
    authaPostVerifyProvider = new AuthaPostVerifyProvider();
  }
});
