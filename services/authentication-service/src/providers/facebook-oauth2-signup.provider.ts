﻿import {BErrors} from 'berrors';

import {Provider} from '@loopback/context';

import {FacebookSignUpFn} from './types';

export class FacebookOauth2SignupProvider implements Provider<FacebookSignUpFn> {
  value(): FacebookSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`FacebookOauth2SignupProvider not implemented`);
    };
  }
}
