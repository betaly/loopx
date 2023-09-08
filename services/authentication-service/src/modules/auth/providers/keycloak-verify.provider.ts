import {AuthenticationErrors, IAuthUser, Keycloak, VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {UserCredentialsRepository, UserRepository} from '@loopx/user-core';

import {SignUpBindings, VerifyBindings} from '../../../providers';
import {KeyCloakPostVerifyFn, KeyCloakPreVerifyFn, KeyCloakSignUpFn} from '../../../providers/types';
import {AuthUser} from '../models/auth-user.model';

export class KeycloakVerifyProvider implements Provider<VerifyFunction.KeycloakAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(SignUpBindings.KEYCLOAK_SIGN_UP_PROVIDER)
    private readonly signupProvider: KeyCloakSignUpFn,
    @inject(VerifyBindings.KEYCLOAK_PRE_VERIFY_PROVIDER)
    private readonly preVerifyProvider: KeyCloakPreVerifyFn,
    @inject(VerifyBindings.KEYCLOAK_POST_VERIFY_PROVIDER)
    private readonly postVerifyProvider: KeyCloakPostVerifyFn,
  ) {}

  value(): VerifyFunction.KeycloakAuthFn {
    return async (accessToken: string, refreshToken: string, profile: Keycloak.Profile) => {
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
      if (
        !creds ||
        creds.authProvider !== 'keycloak' ||
        (creds.authId !== profile.keycloakId && creds.authId !== profile.username)
      ) {
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
