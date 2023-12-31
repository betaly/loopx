﻿import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {KeyCloakSignUpFn} from './types';

export class KeyCloakSignupProvider implements Provider<KeyCloakSignUpFn> {
  value(): KeyCloakSignUpFn {
    return async profile => {
      throw new BErrors.NotImplemented(`KeyCloakSignupProvider not implemented`);
    };
  }
}
