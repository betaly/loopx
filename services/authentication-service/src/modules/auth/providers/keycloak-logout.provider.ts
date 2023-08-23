import {Keycloak, Strategies} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {Provider} from '@loopback/core';
import {encode} from 'base-64';
import {HttpsProxyAgent} from 'https-proxy-agent';
import fetch from 'node-fetch';
import {URLSearchParams} from 'url';

import {AuthLogoutFn} from '../types';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

const getProxyAgent = () => {
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
};

export class KeycloakLogoutProvider implements Provider<AuthLogoutFn> {
  constructor(
    @inject(Strategies.Passport.KEYCLOAK_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: Keycloak.StrategyOptions,
  ) {}

  value(): AuthLogoutFn {
    return async (refreshToken: string) => {
      if (!this.options) {
        throw new Error('Keycloak logout provider is not configured');
      }
      const {host, realm, clientID, clientSecret} = this.options;
      const params = new URLSearchParams();
      const logoutUrl = `${host}/auth/realms/${realm}/protocol/openid-connect/logout`;
      params.append('refresh_token', refreshToken);
      const strToEncode = `${clientID}:${clientSecret}`;
      await fetch(logoutUrl, {
        agent: getProxyAgent(),
        method: 'post',
        body: params,
        headers: {
          Authorization: `Basic ${encode(strToEncode)}`,
        },
      });
      return undefined;
    };
  }
}
