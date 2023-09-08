import {BindingKey, CoreBindings} from '@loopback/core';

import {UserCoreComponent} from './component';

export const UserDataSourceName = 'AuthDB';
export const UserCacheSourceName = 'AuthCache';

export namespace UserCoreBindings {
  export const COMPONENT = BindingKey.create<UserCoreComponent>(`${CoreBindings.COMPONENTS}.UserTenantComponent`);
  export const DEFAULT_USERNAME_PREFIX = BindingKey.create<string>('lx.user-core.defaultUsernamePrefix');
}
