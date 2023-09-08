import {AuthenticationErrors, IAuthUser, VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {UserCredentialsRepository, UserRepository} from '@loopx/user-core';
import * as GoogleStrategy from 'passport-google-oauth20';

import {
  GooglePostVerifyFn,
  GooglePreVerifyFn,
  GoogleSignUpFn,
  SignUpBindings,
  VerifyBindings,
} from '../../../providers';
import {AuthUser} from '../models/auth-user.model';

export class GoogleOauth2VerifyProvider implements Provider<VerifyFunction.GoogleAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.GOOGLE_SIGN_UP_PROVIDER)
    private readonly signupProvider: GoogleSignUpFn,
    @inject(VerifyBindings.GOOGLE_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: GooglePreVerifyFn,
    @inject(VerifyBindings.GOOGLE_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: GooglePostVerifyFn,
  ) {}

  value(): VerifyFunction.GoogleAuthFn {
    return async (accessToken: string, refreshToken: string, profile: GoogleStrategy.Profile) => {
      let user: IAuthUser | null = await this.userRepository.findOne({
        where: {
          email: profile._json.email,
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
      if (!creds || creds.authProvider !== 'google' || creds.authId !== profile.id) {
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
