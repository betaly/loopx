import {Provider} from '@loopback/context';

import {AuthaPreVerifyFn} from './types';

export class AuthaPreVerifyProvider implements Provider<AuthaPreVerifyFn> {
  value(): AuthaPreVerifyFn {
    return async (accessToken, refreshToken, profile, user) => user;
  }
}
