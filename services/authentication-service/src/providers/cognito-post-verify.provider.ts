import {Cognito, IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';

import {CognitoPostVerifyFn} from './types';

export class CognitoPostVerifyProvider implements Provider<CognitoPostVerifyFn> {
  value(): CognitoPostVerifyFn {
    return async (profile: Cognito.Profile, user: IAuthUser | null) => user;
  }
}
