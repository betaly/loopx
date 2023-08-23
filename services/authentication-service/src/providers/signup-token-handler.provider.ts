import {Provider} from '@loopback/core';
import {BErrors} from 'berrors';

import {SignupTokenHandlerFn} from './types';

export class SignupTokenHandlerProvider implements Provider<SignupTokenHandlerFn> {
  value(): SignupTokenHandlerFn {
    return async dto => {
      throw new BErrors.NotImplemented(`SignupTokenHandlerProvider not implemented`);
    };
  }
}
