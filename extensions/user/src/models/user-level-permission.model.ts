import {belongsTo, model, property} from '@loopback/repository';
import {UserUpdatableEntity} from '@loopx/core';

import {UserTenant} from './index';

@model({
  name: 'user_permissions',
})
export class UserLevelPermission extends UserUpdatableEntity<UserLevelPermission> {
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
  })
  permission: string;

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  allowed: boolean;

  @belongsTo(
    () => UserTenant,
    {keyFrom: 'user_tenant_id', name: 'userTenant'},
    {
      name: 'user_tenant_id',
      required: true,
    },
  )
  userTenantId: string;
}
