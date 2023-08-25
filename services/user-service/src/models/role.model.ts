import {hasMany, hasOne, model, property} from '@loopback/repository';
import {UserUpdatableEntity} from '@loopx/core';

import {RoleType} from '../enums';
import {User} from './user.model';
import {UserTenant, UserTenantRelations} from './user-tenant.model';

@model({
  name: 'roles',
})
export class Role extends UserUpdatableEntity<Role> {
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
  name: string;

  @property({
    type: 'number',
    required: true,
    name: 'role_type',
    jsonSchema: {
      maximum: 15,
      minimum: 0,
    },
  })
  roleType: RoleType;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions?: string[];

  @property({
    name: 'allowed_clients',
    type: 'array',
    itemType: 'string',
  })
  allowedClients?: string[];

  @hasMany(() => UserTenant, {keyTo: 'roleId'})
  userTenants: UserTenant[];

  @hasOne(() => User, {keyFrom: 'createdBy', keyTo: 'id'})
  createdByUser?: User;

  @hasOne(() => User, {keyFrom: 'updatedBy', keyTo: 'id'})
  updatedByUser?: User;
}

export interface RoleRelations {
  userTenants: UserTenantRelations[];
}

export type RoleWithRelations = Role & RoleRelations;
