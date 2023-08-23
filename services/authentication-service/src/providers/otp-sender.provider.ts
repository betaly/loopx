import {inject, Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {IOtpRequest} from '../types';
import {VerifyBindings} from './keys';
import {OtpSenderFn} from './types';

export class OtpSenderProvider implements Provider<OtpSenderFn> {
  constructor(
    @inject(VerifyBindings.OTP_EMAIL_SENDER_PROVIDER)
    private readonly sendEmail: OtpSenderFn,
    @inject(VerifyBindings.OTP_SMS_SENDER_PROVIDER)
    private readonly sendSms: OtpSenderFn,
  ) {}

  value(): OtpSenderFn {
    return async (otp: string, request: IOtpRequest) => {
      if (request.conn === 'email') {
        return this.sendEmail(otp, request);
      } else if (request.conn === 'sms') {
        return this.sendSms(otp, request);
      } else {
        throw new BErrors.BadRequest('Unsupported otp request connection type: ' + request.conn);
      }
    };
  }
}
