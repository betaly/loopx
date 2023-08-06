﻿import {BErrors} from 'berrors';

import {Provider} from '@loopback/context';

import {AzureAdSignUpFn} from './types';

export class AzureAdSignupProvider implements Provider<AzureAdSignUpFn> {
  value(): AzureAdSignUpFn {
    // sonarignore:start
    return async profile => {
      // sonarignore:end
      throw new BErrors.NotImplemented(`AzureAdSignupProvider not implemented`);
    };
  }
}
