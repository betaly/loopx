import {hasMany, hasOne, model, property} from '@loopback/repository';
import {UserUpdatableEntity} from '@loopx/core';

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
    defaultFn: 'uuidv4',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    name: 'role_key',
    description: 'The role key in snake case is used to identify the role in the system',
  })
  roleKey: string;

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
