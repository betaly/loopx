import {AuthenticationErrors, IAuthUser, VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserCredentialsRepository, UserRepository} from '@loopx/user-core';
import * as AzureADStrategy from 'passport-azure-ad';

import {
  AzureAdPostVerifyFn,
  AzureAdPreVerifyFn,
  AzureAdSignUpFn,
  SignUpBindings,
  VerifyBindings,
} from '../../../providers';
import {AuthUser} from '../models/auth-user.model';

export class AzureAdVerifyProvider implements Provider<VerifyFunction.AzureADAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.AZURE_AD_SIGN_UP_PROVIDER)
    private readonly signupProvider: AzureAdSignUpFn,
    @inject(VerifyBindings.AZURE_AD_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: AzureAdPreVerifyFn,
    @inject(VerifyBindings.AZURE_AD_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: AzureAdPostVerifyFn,
  ) {}

  value(): VerifyFunction.AzureADAuthFn {
    return async (accessToken: string, refreshToken: string, profile: AzureADStrategy.IProfile) => {
      let user: IAuthUser | null = await this.userRepository.findOne({
        where: {
          email: profile.upn,
        },
      });
      user = await this.preVerifyProvider(accessToken, refreshToken, profile, user);
      if (!user) {
        user = await this.signupProvider(profile);
      }
      if (!user) {
        throw new AuthenticationErrors.InvalidCredentials();
      }
      const creds = await this.userCredsRepository.findOne({
        where: {
          userId: user.id as string,
        },
      });
      if (!creds || creds.authProvider !== 'azure') {
        throw new AuthenticationErrors.InvalidCredentials();
      }

      const authUser: AuthUser = new AuthUser({
        ...user,
        id: user.id as string,
      });
      authUser.permissions = [];
      authUser.externalAuthToken = accessToken;
      authUser.externalRefreshToken = refreshToken;
      return this.postVerifyProvider(profile, authUser);
    };
  }
}
