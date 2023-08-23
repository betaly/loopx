import {AuthenticationErrors} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {ILogger, LOGGER} from '@loopx/core';
import {totp} from 'otplib';

import {OtpGenerateFn} from './types';

const otpStep = 300;
const otpWindow = 0;

export class OtpGenerateProvider implements Provider<OtpGenerateFn> {
  constructor(@inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger) {}

  value(): OtpGenerateFn {
    return async (secret: string) => {
      if (!secret) {
        this.logger.error('Invalid OTP secret');
        throw new AuthenticationErrors.InvalidCredentials();
      }
      totp.options = {
        step: +(process.env.OTP_STEP ?? otpStep),
        window: +(process.env.OTP_WINDOW ?? otpWindow),
      };
      return totp.generate(secret);
    };
  }
}
