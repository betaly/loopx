import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as FacebookStrategy from 'passport-facebook';

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
