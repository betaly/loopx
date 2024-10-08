﻿import {expect} from '@loopback/testlab';
import * as GoogleStrategy from 'passport-google-oauth20';
import sinon from 'sinon';

import {GooglePostVerifyProvider} from '../../providers';

describe('Google Oauth Post Verify Service', () => {
  let googlePostVerifyProvider: GooglePostVerifyProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  const profile: GoogleStrategy.Profile = {
    id: 'test_id',
    displayName: 'test_display_name',
    profileUrl: 'test_profile_url',
    _raw: 'test_raw',
    _json: {
      iss: 'test',
      aud: 'test',
      sub: 'test',
      iat: 1353601026,
      exp: 1353601026,
    },
    provider: 'google',
  };
  const user = null;

  describe('Post Verify Service', () => {
    it('checks if provider returns a function', async () => {
      const result = googlePostVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider function returns a promise which returns the user', async () => {
      const func = googlePostVerifyProvider.value();
      const result = await func(profile, user);
      expect(result).to.be.eql(user);
    });
  });

  function setUp() {
    googlePostVerifyProvider = new GooglePostVerifyProvider();
  }
});
