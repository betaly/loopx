import {BindingKey, CoreBindings} from '@loopback/core';

import {UserComponent} from './component';

export const UserDataSourceName = 'AuthDB';
export const UserCacheSourceName = 'AuthCache';

export namespace UserBindings {
  export const COMPONENT = BindingKey.create<UserComponent>(`${CoreBindings.COMPONENTS}.UserTenantComponent`);
}
