import {BindingKey} from '@loopback/core';

import {AuthLogoutFn} from './types';

export const buildLogoutBindingKey = (provider: string) => `ml.${provider}.logout.provider`;

export namespace LogoutBindings {
  export const AUTHA_LOGOUT_PROVIDER = BindingKey.create<AuthLogoutFn>(buildLogoutBindingKey('autha'));
  export const KEYCLOAK_LOGOUT_PROVIDER = BindingKey.create<AuthLogoutFn>(buildLogoutBindingKey('keycloak'));
}
