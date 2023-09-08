import {BindingKey} from '@loopback/context';
import {Role} from '@loopx/user-core';

export namespace AuthExampleBindings {
  export const DEFAULT_ROLE = BindingKey.create<Role>('loopauth.api.default-role');
}
