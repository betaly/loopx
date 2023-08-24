import {Provider} from '@loopback/context';

import {OtpSenderFn} from '../../../providers';

export const OtpCodeCache = new Map<string, string>();

export class OtpSenderProvider implements Provider<OtpSenderFn> {
  value(): OtpSenderFn {
    return async (otp, req) => {
      OtpCodeCache.set(req.contact, otp);
    };
  }
}
