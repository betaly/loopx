import {belongsTo, model, property} from '@loopback/repository';
import {UserUpdatableEntity} from '@loopx/core';

import {UserConfigKey} from '../enums';
import {UserTenant} from './user-tenant.model';

@model({
  name: 'user_tenant_prefs',
  settings: {
    defaultIdSort: false,
  },
})
export class UserTenantPrefs extends UserUpdatableEntity<UserTenantPrefs> {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    name: 'config_key',
  })
  configKey: UserConfigKey;

  @property({
    type: 'object',
    required: true,
    name: 'config_value',
  })
  configValue?: object;

  @belongsTo(
    () => UserTenant,
    {keyFrom: 'userTenantId'},
    {
      name: 'user_tenant_id',
      required: false,
    },
  )
  userTenantId: string;
}
