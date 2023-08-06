import * as FacebookStrategy from 'passport-facebook';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {FacebookPostVerifyFn} from './types';

export class FacebookPostVerifyProvider implements Provider<FacebookPostVerifyFn> {
  value(): FacebookPostVerifyFn {
    return async (profile: FacebookStrategy.Profile, user: IAuthUser | null) => user;
  }
}
