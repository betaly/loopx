import {BindingKey, CoreBindings} from '@loopback/core';

import {BINDING_PREFIX} from '@loopx/core';

import {UserTenantServiceComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace UserTenantServiceBindings {
  export const COMPONENT = BindingKey.create<UserTenantServiceComponent>(
    `${CoreBindings.COMPONENTS}.UserTenantServiceComponent`,
  );

  export const DEFAULT_TENANT = BindingKey.create<string>(`${BINDING_PREFIX}.tenant.default`);
}

export const UserTenantDataSourceName = 'AuthDB';
export const UserTenantCacheSourceName = 'AuthCache';
