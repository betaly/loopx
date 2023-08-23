import {VerifyFunction} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import {verify} from 'jsonwebtoken';

import {JWT_ISSUER, JWT_SECRET} from './consts';
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
      return verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
      }) as IAuthUserWithPermissions;
    };
  }
}
