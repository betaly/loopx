import {Provider} from '@loopback/context';

import {OtpSenderFn} from '../../../providers';

export const OtpCodeCache = new Map<string, string>();

export class OtpSenderProvider implements Provider<OtpSenderFn> {
  value(): OtpSenderFn {
    return async (_otp, _applicant) => {
      OtpCodeCache.set(_applicant.uci, _otp);
    };
  }
}
