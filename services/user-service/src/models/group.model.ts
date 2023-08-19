import {DataObject, Model, hasMany, model, property} from '@loopback/repository';

import {UserUpdatableEntity} from '@loopx/core';

import {UserTenantGroupType} from '../enums';
import {UserGroup, UserGroupWithRelations} from './user-group.model';

@model({
  name: 'groups',
  settings: {
    defaultIdSort: false,
  },
})
export class Group<T = DataObject<Model>> extends UserUpdatableEntity<T & Group> {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    name: 'photo_url',
    type: 'string',
    required: false,
  })
  photoUrl?: string;

  @property({
    name: 'group_type',
    jsonSchema: {
      enum: Object.values(UserTenantGroupType),
    },
    default: UserTenantGroupType.Tenant,
  })
  groupType?: UserTenantGroupType;

  @hasMany(() => UserGroup, {keyTo: 'groupId'})
  userGroups: UserGroup[];
}

export interface GroupRelations {
  userGroups: UserGroupWithRelations;
}

export type GroupWithRelations = Group & GroupRelations;
