import {expect} from '@loopback/testlab';
import sinon from 'sinon';

import {OtpGenerateProvider} from '../../providers/otp-generate.provider';
import {NullLogger} from '@loopx/core';

describe('OTP Generate Provider', () => {
  let otpGenerateProvider: OtpGenerateProvider;

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('otp generate provider', () => {
    it('checks if provider returns a function', async () => {
      const result = otpGenerateProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider is generating otp', async () => {
      const secret = 'i6im0gc96j0mn00c';
      const func = otpGenerateProvider.value();
      const result = await func(secret);
      expect(result).to.be.String();
    });
  });

  function setUp() {
    otpGenerateProvider = new OtpGenerateProvider(new NullLogger());
  }
});
