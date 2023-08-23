import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as AppleStrategy from 'passport-apple';

import {ApplePostVerifyFn} from './types';

export class ApplePostVerifyProvider implements Provider<ApplePostVerifyFn> {
  value(): ApplePostVerifyFn {
    return async (profile: AppleStrategy.Profile, user: IAuthUser | null) => user;
  }
}
