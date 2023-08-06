import {DataObject, model, property} from '@loopback/repository';

import {ModelTypes, RoleTypes, UserUpdatableEntity} from '@loopx/core';

@model({
  name: 'roles',
})
export class Role extends UserUpdatableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id: string;

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
  roleType: RoleTypes;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions: string[];

  @property({
    name: 'allowed_clients',
    type: 'array',
    itemType: 'string',
  })
  allowedClients?: string[];

  constructor(data?: DataObject<Role>) {
    super(data);
  }
}

export type RoleWithRelations = Role;

export type RoleModelTypes = ModelTypes<Role, typeof Role.prototype.id>;
