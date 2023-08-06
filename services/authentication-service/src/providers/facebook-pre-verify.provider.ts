import * as FacebookStrategy from 'passport-facebook';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {FacebookPreVerifyFn} from './types';

export class FacebookPreVerifyProvider implements Provider<FacebookPreVerifyFn> {
  value(): FacebookPreVerifyFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: FacebookStrategy.Profile,
      user: IAuthUser | null,
    ) => user;
  }
}
