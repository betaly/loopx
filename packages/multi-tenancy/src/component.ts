import {Binding, Component, Constructor, createBindingFromClass, extensionFor} from '@loopback/core';

import {MULTI_TENANCY_STRATEGIES, MultiTenancyBindings} from './keys';
import {MultiTenancyMiddlewareProvider} from './middleware/multi-tenancy-middleware.provider';
import {DefaultTenantResolverProvider} from './providers';
import {strategies} from './strategies';

export class MultiTenancyComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(MultiTenancyMiddlewareProvider, {
      key: MultiTenancyBindings.MIDDLEWARE,
    }),
    ...strategies.map((strategy: Constructor<unknown>) =>
      createBindingFromClass(strategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    ),
  ];

  providers = {
    [MultiTenancyBindings.TENANT_RESOLVER.key]: DefaultTenantResolverProvider,
  };
}
