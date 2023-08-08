import {Binding, Component, Constructor, createBindingFromClass, extensionFor, inject} from '@loopback/core';

import {MULTI_TENANCY_STRATEGIES, MultiTenancyBindings} from './keys';
import {MultiTenancyMiddlewareProvider} from './middlewares';
import {DefaultTenantResolverProvider, MultiTenancyActionProvider} from './providers';
import {strategies} from './strategies';
import {MultiTenancyConfig} from './types';

export class MultiTenancyComponent implements Component {
  bindings: Binding[] = strategies.map((strategy: Constructor<unknown>) =>
    createBindingFromClass(strategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
  );

  providers = {
    [MultiTenancyBindings.ACTION.key]: MultiTenancyActionProvider,
    [MultiTenancyBindings.TENANT_RESOLVER.key]: DefaultTenantResolverProvider,
  };

  constructor(
    @inject(MultiTenancyBindings.CONFIG, {optional: true})
    private readonly config?: MultiTenancyConfig,
  ) {
    if (this.config?.useMultiTenancyMiddleware) {
      this.bindings.push(createBindingFromClass(MultiTenancyMiddlewareProvider));
    }
  }
}
