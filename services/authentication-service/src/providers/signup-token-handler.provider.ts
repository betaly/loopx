import {BErrors} from 'berrors';

import {Provider} from '@loopback/core';

import {SignupTokenHandlerFn} from './types';

export class SignupTokenHandlerProvider implements Provider<SignupTokenHandlerFn> {
  value(): SignupTokenHandlerFn {
    return async dto => {
      throw new BErrors.NotImplemented(`SignupTokenHandlerProvider not implemented`);
    };
  }
}
