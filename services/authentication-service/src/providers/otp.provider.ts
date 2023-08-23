import {inject, Provider} from '@loopback/context';
import {authenticator} from 'otplib';

import {OtpGenerateFn, OtpSenderFn, VerifyBindings} from '../providers';
import {IOtpRequest} from '../types';
import {OtpFn} from './types';

export class OtpProvider implements Provider<OtpFn> {
  constructor(
    @inject(VerifyBindings.OTP_GENERATE_PROVIDER)
    private readonly generateOtp: OtpGenerateFn,
    @inject(VerifyBindings.OTP_SENDER_PROVIDER)
    private readonly sendOtp: OtpSenderFn,
  ) {}

  value(): OtpFn {
    return async (request: IOtpRequest) => {
      const secret = authenticator.generateSecret();
      const otp = await this.generateOtp(secret);
      await this.sendOtp(otp, request);
      return {
        key: secret,
      };
    };
  }
}
