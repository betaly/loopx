import {AuthenticationErrors, Cognito, IAuthUser, VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {UserCredentialsRepository, UserRepository} from '@loopx/user-core';

import {
  CognitoPostVerifyFn,
  CognitoPreVerifyFn,
  CognitoSignUpFn,
  SignUpBindings,
  VerifyBindings,
} from '../../../providers';
import {AuthUser} from '../models/auth-user.model';

export class CognitoOauth2VerifyProvider implements Provider<VerifyFunction.CognitoAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.COGNITO_SIGN_UP_PROVIDER)
    private readonly signupProvider: CognitoSignUpFn,
    @inject(VerifyBindings.COGNITO_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: CognitoPreVerifyFn,
    @inject(VerifyBindings.COGNITO_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: CognitoPostVerifyFn,
  ) {}

  value(): VerifyFunction.CognitoAuthFn {
    return async (accessToken: string, refreshToken: string, profile: Cognito.Profile) => {
      let user: IAuthUser | null = await this.userRepository.findOne({
        where: {
          email: profile.email,
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
      if (!creds || creds.authProvider !== 'aws-cognito' || creds.authId !== profile.sub) {
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
