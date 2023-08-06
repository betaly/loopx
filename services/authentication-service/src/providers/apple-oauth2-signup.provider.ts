﻿import {BErrors} from 'berrors';

import {Provider} from '@loopback/context';

import {AppleSignUpFn} from './types';

export class AppleOauth2SignupProvider implements Provider<AppleSignUpFn> {
  value(): AppleSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`AppleOauth2SignupProvider not implemented`);
    };
  }
}
