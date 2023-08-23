import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {InstagramSignUpFn} from './types';

export class InstagramOauth2SignupProvider implements Provider<InstagramSignUpFn> {
  value(): InstagramSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`InstagramOauth2SignupProvider not implemented`);
    };
  }
}
