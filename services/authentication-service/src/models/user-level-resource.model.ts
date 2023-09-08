import {belongsTo, model, property} from '@loopback/repository';
import {ModelTypes, UserUpdatableEntity} from '@loopx/core';
import {UserTenant} from '@loopx/user-core';

@model({
  name: 'user_resources',
})
export class UserLevelResource extends UserUpdatableEntity {
  @property({
    name: 'id',
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @belongsTo(
    () => UserTenant,
    {keyFrom: 'userTenantId', name: 'userTenant'},
    {
      name: 'user_tenant_id',
      required: true,
    },
  )
  userTenantId: string;

  @property({
    type: 'string',
    required: true,
    name: 'resource_name',
  })
  resourceName: string;

  @property({
    type: 'string',
    required: true,
    name: 'resource_value',
  })
  resourceValue: string;

  @property({
    type: 'boolean',
    required: true,
    default: true,
    name: 'allowed',
  })
  allowed: boolean;

  constructor(data?: Partial<UserLevelResource>) {
    super(data);
  }
}

export type UserLevelResourceTypes = ModelTypes<UserLevelResource, typeof UserLevelResource.prototype.id>;
