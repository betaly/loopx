import {Provider} from '@loopback/context';

import {AuthaPostVerifyFn} from './types';

export class AuthaPostVerifyProvider implements Provider<AuthaPostVerifyFn> {
  value(): AuthaPostVerifyFn {
    return async (profile, user) => user;
  }
}
