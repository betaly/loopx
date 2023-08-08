import {Provider} from '@loopback/core';

import {Tenant, TenantResolverFn} from '../types';

export class DefaultTenantResolverProvider implements Provider<TenantResolverFn> {
  value() {
    return (idOrHost: string): Tenant => {
      return {
        id: idOrHost,
      };
    };
  }
}
