import * as FacebookStrategy from 'passport-facebook';

import {Provider, inject} from '@loopback/context';
import {repository} from '@loopback/repository';

import {AuthenticationErrors, IAuthUser, VerifyFunction} from '@bleco/authentication';

import {
  FacebookPostVerifyFn,
  FacebookPreVerifyFn,
  FacebookSignUpFn,
  SignUpBindings,
  VerifyBindings,
} from '../../../providers';
import {UserCredentialsRepository, UserRepository} from '../../../repositories';
import {AuthUser} from '../models/auth-user.model';

export class FacebookOauth2VerifyProvider implements Provider<VerifyFunction.FacebookAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.FACEBOOK_SIGN_UP_PROVIDER)
    private readonly signupProvider: FacebookSignUpFn,
    @inject(VerifyBindings.FACEBOOK_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: FacebookPreVerifyFn,
    @inject(VerifyBindings.FACEBOOK_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: FacebookPostVerifyFn,
  ) {}

  value(): VerifyFunction.FacebookAuthFn {
    return async (accessToken: string, refreshToken: string, profile: FacebookStrategy.Profile) => {
      let user: IAuthUser | null = await this.userRepository.findOne({
        where: {
          email: profile._json.email,
        },
      });
      user = await this.preVerifyProvider(accessToken, refreshToken, profile, user);
      if (!user) {
        const newUser = await this.signupProvider(profile);
        if (newUser) {
          user = newUser;
        } else {
          throw new AuthenticationErrors.InvalidCredentials();
        }
      }
      const creds = await this.userCredsRepository.findOne({
        where: {
          userId: user.id as string,
        },
      });
      if (!creds || creds.authProvider !== 'facebook' || creds.authId !== profile.id) {
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
