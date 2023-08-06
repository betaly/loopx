import * as AzureADStrategy from 'passport-azure-ad';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {AzureAdPostVerifyFn} from './types';

export class AzurePostVerifyProvider implements Provider<AzureAdPostVerifyFn> {
  value(): AzureAdPostVerifyFn {
    // sonarignore:start
    return async (profile: AzureADStrategy.IProfile, user: IAuthUser | null) =>
      // sonarignore:end
      user;
  }
}
