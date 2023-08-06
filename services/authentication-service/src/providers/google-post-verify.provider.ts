import * as GoogleStrategy from 'passport-google-oauth20';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {GooglePostVerifyFn} from './types';

export class GooglePostVerifyProvider implements Provider<GooglePostVerifyFn> {
  value(): GooglePostVerifyFn {
    return async (profile: GoogleStrategy.Profile, user: IAuthUser | null) => user;
  }
}
