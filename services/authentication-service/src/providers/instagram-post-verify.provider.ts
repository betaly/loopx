import * as InstagramStrategy from 'passport-instagram';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {InstagramPostVerifyFn} from './types';

export class InstagramPostVerifyProvider implements Provider<InstagramPostVerifyFn> {
  value(): InstagramPostVerifyFn {
    return async (profile: InstagramStrategy.Profile, user: IAuthUser | null) => user;
  }
}
