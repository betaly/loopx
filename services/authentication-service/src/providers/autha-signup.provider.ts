import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {AuthaSignUpFn} from './types';

export class AuthaSignupProvider implements Provider<AuthaSignUpFn> {
  value(): AuthaSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`AuthaSignupProvider not implemented`);
    };
  }
}
