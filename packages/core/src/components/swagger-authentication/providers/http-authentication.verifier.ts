import {inject, Provider} from '@loopback/core';

import {LxCoreBindings} from '../../../keys';
import {CoreConfig} from '../../../types';
import {HttpAuthenticationVerifier} from '../types';

export class HttpAuthenticationVerifierProvider implements Provider<HttpAuthenticationVerifier> {
  constructor(
    @inject(LxCoreBindings.config, {optional: true})
    private readonly coreConfig: CoreConfig,
  ) {}
  value(): HttpAuthenticationVerifier {
    return (username, password) => {
      return username === this.coreConfig.swaggerUsername && password === this.coreConfig.swaggerPassword;
    };
  }
}
