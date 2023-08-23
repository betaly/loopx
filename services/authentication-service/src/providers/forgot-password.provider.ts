import {Provider} from '@loopback/core';
import {BErrors} from 'berrors';

import {ForgotPasswordHandlerFn} from './types';

export class ForgotPasswordProvider implements Provider<ForgotPasswordHandlerFn> {
  value(): ForgotPasswordHandlerFn {
    return async dto => {
      throw new BErrors.NotImplemented(`ForgotPasswordProvider not implemented`);
    };
  }
}
