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
    name: 'name',
    required: true,
    description: 'The name of the role, used for display purposes',
  })
  name: string;

  @property({
    type: 'string',
    name: 'code',
    required: true,
    description: 'The code of the role, used for programmatic purposes',
  })
  code: string;

  @property({
    type: 'string',
    name: 'description',
    description: 'The description of the role, used for display purposes',
  })
  description?: string;

  @property({
    type: 'boolean',
    name: 'protected',
    description: 'Whether this role can be deleted or not',
  })
  protected?: boolean;

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
