import {belongsTo, model, property} from '@loopback/repository';

import {UserUpdatableEntity} from '@loopx/core';

import {Group, GroupWithRelations} from './group.model';
import {UserTenant, UserTenantWithRelations} from './user-tenant.model';

@model({
  name: 'user_groups',
  settings: {
    defaultIdSort: false,
  },
})
export class UserGroup extends UserUpdatableEntity<UserGroup> {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @belongsTo(
    () => Group,
    {name: 'group'},
    {
      name: 'group_id',
      required: true,
    },
  )
  groupId: string;

  @belongsTo(
    () => UserTenant,
    {name: 'userTenant'},
    {
      name: 'user_tenant_id',
      required: true,
    },
  )
  userTenantId: string;

  @property({
    name: 'is_owner',
    type: 'boolean',
    default: false,
  })
  isOwner?: boolean;
}

export interface UserGroupRelations {
  group: GroupWithRelations;
  userTenant: UserTenantWithRelations;
}

export type UserGroupWithRelations = UserGroup & UserGroupRelations;
