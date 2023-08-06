import * as AppleStrategy from 'passport-apple';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {ApplePostVerifyFn} from './types';

export class ApplePostVerifyProvider implements Provider<ApplePostVerifyFn> {
  value(): ApplePostVerifyFn {
    return async (profile: AppleStrategy.Profile, user: IAuthUser | null) => user;
  }
}
