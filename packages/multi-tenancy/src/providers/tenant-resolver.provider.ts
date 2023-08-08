import {Provider} from '@loopback/core';

import {ITenant, TenantResolverFn} from '../types';

export class DefaultTenantResolverProvider implements Provider<TenantResolverFn> {
  value() {
    return (idOrHost: string): ITenant => {
      return {
        id: idOrHost,
      };
    };
  }
}
