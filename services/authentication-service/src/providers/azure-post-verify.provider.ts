import {IAuthUser} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import * as AzureADStrategy from 'passport-azure-ad';

import {AzureAdPostVerifyFn} from './types';

export class AzurePostVerifyProvider implements Provider<AzureAdPostVerifyFn> {
  value(): AzureAdPostVerifyFn {
    // sonarignore:start
    return async (profile: AzureADStrategy.IProfile, user: IAuthUser | null) =>
      // sonarignore:end
      user;
  }
}
