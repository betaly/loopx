import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {GoogleSignUpFn} from './types';

export class GoogleOauth2SignupProvider implements Provider<GoogleSignUpFn> {
  value(): GoogleSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`GoogleOauth2SignupProvider not implemented`);
    };
  }
}
