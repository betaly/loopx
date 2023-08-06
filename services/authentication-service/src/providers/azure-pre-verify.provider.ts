import * as AzureADStrategy from 'passport-azure-ad';

import {Provider} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {AzureAdPreVerifyFn} from './types';

export class AzurePreVerifyProvider implements Provider<AzureAdPreVerifyFn> {
  value(): AzureAdPreVerifyFn {
    return async (
      // sonarignore:start
      accessToken: string,
      refreshToken: string,
      profile: AzureADStrategy.IProfile,
      user: IAuthUser | null,
      // sonarignore:end
    ) => user;
  }
}
