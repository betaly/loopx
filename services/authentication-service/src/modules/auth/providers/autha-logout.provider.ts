import * as AuthaStrategy from '@authajs/passport-autha';
import {Strategies} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {Provider} from '@loopback/core';

import {AuthLogoutFn} from '../types';

type StrategyOptions = (AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest) & {
  postLogoutRedirectUri: string;
};

export class AuthaLogoutProvider implements Provider<AuthLogoutFn> {
  constructor(
    @inject(Strategies.Passport.AUTHA_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: StrategyOptions,
  ) {}

  value(): AuthLogoutFn {
    return async (refreshToken, state) => {
      if (!this.options?.endpoint || !this.options?.clientID) {
        throw new Error('Autha logout provider is not configured');
      }
      const {endpoint, clientID, postLogoutRedirectUri} = this.options;
      const params = new URLSearchParams({
        client_id: clientID,
        state,
      });
      if (postLogoutRedirectUri) {
        params.append('post_logout_redirect_uri', postLogoutRedirectUri);
      }
      return `${endpoint}/oidc/session/end?${params.toString()}`;
    };
  }
}
