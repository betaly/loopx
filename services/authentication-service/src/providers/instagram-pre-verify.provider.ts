import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as InstagramStrategy from 'passport-instagram';

import {InstagramPreVerifyFn} from './types';

export class InstagramPreVerifyProvider implements Provider<InstagramPreVerifyFn> {
  value(): InstagramPreVerifyFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: InstagramStrategy.Profile,
      user: IAuthUser | null,
    ) => user;
  }
}
