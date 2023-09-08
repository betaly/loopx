import {BindingKey, CoreBindings} from '@loopback/core';
import {BINDING_PREFIX} from '@loopx/core';

import {UserServiceComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace UserServiceBindings {
  export const COMPONENT = BindingKey.create<UserServiceComponent>(`${CoreBindings.COMPONENTS}.UserServiceComponent`);

  export const DEFAULT_TENANT = BindingKey.create<string>(`${BINDING_PREFIX}.tenant.default`);
}
