import {IAuthUser, Keycloak} from '@bleco/authentication';
import {Provider} from '@loopback/context';

import {KeyCloakPostVerifyFn} from './types';

export class KeyCloakPostVerifyProvider implements Provider<KeyCloakPostVerifyFn> {
  value(): KeyCloakPostVerifyFn {
    return async (profile: Keycloak.Profile, user: IAuthUser | null) => user;
  }
}
