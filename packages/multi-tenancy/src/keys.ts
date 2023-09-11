import {BindingKey} from '@loopback/core';

import {IdentifyTenantFn, ITenant, MultiTenancyConfig, MultiTenancyPostProcess, TenantResolverFn} from './types';

export namespace MultiTenancyBindings {
  export const CONFIG = BindingKey.create<MultiTenancyConfig>('loopx.multi-tenancy.config');

  export const ACTION = BindingKey.create<IdentifyTenantFn>('loopx.multi-tenancy.identifyTenant');

  export const CURRENT_TENANT = BindingKey.create<ITenant>('loopx.multi-tenancy.currentTenant');

  export const POST_PROCESS = BindingKey.create<MultiTenancyPostProcess>('loopx.multi-tenancy.postProcess');

  export const TENANT_RESOLVER = BindingKey.create<TenantResolverFn>('loopx.multi-tenancy.tenantResolver');
}

export const MULTI_TENANCY_STRATEGIES = 'loopx.multi-tenancy.strategies';
