import {Provider} from '@loopback/context';

import {IAuthUser, Keycloak} from '@bleco/authentication';

import {KeyCloakPreVerifyFn} from './types';

export class KeyCloakPreVerifyProvider implements Provider<KeyCloakPreVerifyFn> {
  value(): KeyCloakPreVerifyFn {
    return async (accessToken: string, refreshToken: string, profile: Keycloak.Profile, user: IAuthUser | null) => user;
  }
}
