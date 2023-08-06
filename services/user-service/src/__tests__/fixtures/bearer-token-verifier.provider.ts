﻿import {verify} from 'jsonwebtoken';

import {Provider} from '@loopback/context';

import {VerifyFunction} from '@bleco/authentication';

import {IAuthUserWithPermissions} from './keys';

export class BearerTokenVerifyProvider implements Provider<VerifyFunction.BearerFn> {
  constructor() {
    // Empty constructor
  }

  value(): VerifyFunction.BearerFn {
    return async (token: string) => {
      /*
        Implementing a basic JWT token decryption here
        Leaving the additional security to the consumer of this application

        Suggestion: to revoke these tokens put them in redis or some in-memory
        database.
        Use global interceptor over this to apply that check on each api.
      */
      return verify(token, 'kdskssdkdfs', {
        issuer: 'sf',
      }) as IAuthUserWithPermissions;
    };
  }
}
