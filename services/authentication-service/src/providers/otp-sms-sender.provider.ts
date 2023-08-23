﻿import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {IOtpRequest} from '../types';
import {OtpSenderFn} from './types';

export class OtpSmsSenderProvider implements Provider<OtpSenderFn> {
  value(): OtpSenderFn {
    return async (_otp: string, _request: IOtpRequest) => {
      throw new BErrors.NotImplemented(`OtpSmsSender not implemented`);
    };
  }
}
