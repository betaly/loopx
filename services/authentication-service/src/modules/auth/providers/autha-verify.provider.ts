import * as AuthaStrategy from '@authajs/passport-autha';

import {Provider, inject} from '@loopback/context';
import {Where} from '@loopback/filter/src/query';
import {repository} from '@loopback/repository';

import {AuthenticationErrors, IAuthUser, VerifyFunction} from '@bleco/authentication';

import {User} from '../../../models';
import {AuthaPostVerifyFn, AuthaPreVerifyFn, AuthaSignUpFn, SignUpBindings, VerifyBindings} from '../../../providers';
import {UserCredentialsRepository, UserRepository} from '../../../repositories';
import {AuthUser} from '../models/auth-user.model';

export class AuthaVerifyProvider implements Provider<VerifyFunction.AuthaFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.AUTHA_SIGNUP_PROVIDER)
    private readonly signupProvider: AuthaSignUpFn,
    @inject(VerifyBindings.AUTHA_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: AuthaPreVerifyFn,
    @inject(VerifyBindings.AUTHA_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: AuthaPostVerifyFn,
  ) {}

  value(): VerifyFunction.AuthaFn {
    return async (accessToken: string, refreshToken: string, profile: AuthaStrategy.Profile) => {
      const or: Where<User>[] = [];
      if (profile.email) {
        or.push({email: profile.email});
      }
      if (profile.phone) {
        or.push({phone: profile.phone});
      }
      if (profile.username) {
        or.push({username: profile.username});
      }
      let user: IAuthUser | null = await this.userRepository.findOne({
        where: {or},
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
      if (!creds || creds.authProvider !== 'autha' || creds.authId !== profile.id) {
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
