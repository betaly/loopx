import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as FacebookStrategy from 'passport-facebook';

import {FacebookPostVerifyFn} from './types';

export class FacebookPostVerifyProvider implements Provider<FacebookPostVerifyFn> {
  value(): FacebookPostVerifyFn {
    return async (profile: FacebookStrategy.Profile, user: IAuthUser | null) => user;
  }
}
