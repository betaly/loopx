﻿import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as GoogleStrategy from 'passport-google-oauth20';

import {GooglePreVerifyFn} from './types';

export class GooglePreVerifyProvider implements Provider<GooglePreVerifyFn> {
  value(): GooglePreVerifyFn {
    return async (accessToken: string, refreshToken: string, profile: GoogleStrategy.Profile, user: IAuthUser | null) =>
      user;
  }
}
