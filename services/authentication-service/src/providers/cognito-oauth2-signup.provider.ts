import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {CognitoSignUpFn} from './types';

export class CognitoOauth2SignupProvider implements Provider<CognitoSignUpFn> {
  value(): CognitoSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`CognitoOauth2SignupProvider not implemented`);
    };
  }
}
