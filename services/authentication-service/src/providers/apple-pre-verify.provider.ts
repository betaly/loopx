import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as AppleStrategy from 'passport-apple';

import {ApplePreVerifyFn} from './types';

export class ApplePreVerifyProvider implements Provider<ApplePreVerifyFn> {
  value(): ApplePreVerifyFn {
    return async (accessToken: string, refreshToken: string, profile: AppleStrategy.Profile, user: IAuthUser | null) =>
      user;
  }
}
