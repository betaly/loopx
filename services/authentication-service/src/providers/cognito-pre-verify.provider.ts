import {Provider} from '@loopback/context';

import {Cognito, IAuthUser} from '@bleco/authentication';

import {CognitoPreVerifyFn} from './types';

export class CognitoPreVerifyProvider implements Provider<CognitoPreVerifyFn> {
  value(): CognitoPreVerifyFn {
    return async (accessToken: string, refreshToken: string, profile: Cognito.Profile, user: IAuthUser | null) => user;
  }
}
