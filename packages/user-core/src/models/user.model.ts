import {IAuthUser} from '@bleco/authentication';
import {belongsTo, DataObject, hasMany, hasOne, Model, model, property} from '@loopback/repository';
import {Gender, UserUpdatableEntity} from '@loopx/core';

import {
  Tenant,
  TenantWithRelations,
  UserCredentials,
  UserCredentialsWithRelations,
  UserTenant,
  UserTenantWithRelations,
} from '../models';

@model({
  name: 'users',
  description: 'This is signature for user model.',
})
export class User<T = DataObject<Model>> extends UserUpdatableEntity<T & User> implements IAuthUser {
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
  username: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    name: 'first_name',
  })
  firstName?: string;

  @property({
    type: 'string',
    name: 'last_name',
  })
  lastName?: string;

  @property({
    type: 'string',
    name: 'middle_name',
  })
  middleName?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  designation?: string;

  @property({
    type: 'string',
    jsonSchema: {
      pattern: `^\\+?[1-9]\\d{1,14}$`,
    },
  })
  phone?: string;

  @property({
    type: 'array',
    itemType: 'number',
    name: 'auth_client_ids',
  })
  authClientIds?: number[];

  @property({
    type: 'date',
    name: 'last_login',
    postgresql: {
      column: 'last_login',
    },
  })
  lastLogin?: Date;

  @property({
    name: 'photo_url',
    type: 'string',
  })
  photoUrl?: string;

  @property({
    type: 'string',
    description: `This field takes a single character as input in database.
    'M' for male and 'F' for female.`,
    jsonSchema: {
      enum: ['M', 'F', 'O'],
    },
  })
  gender?: Gender;

  @property({
    type: 'date',
  })
  dob?: Date;

  @belongsTo(
    () => Tenant,
    {keyFrom: 'defaultTenantId', name: 'defaultTenant'},
    {
      name: 'default_tenant_id',
      required: false,
    },
  )
  defaultTenantId?: string;

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  credentials: UserCredentials;

  @hasMany(() => UserTenant, {keyTo: 'userId'})
  userTenants: UserTenant[];
}

export interface UserRelations {
  defaultTenant: TenantWithRelations;
  credentials: UserCredentialsWithRelations;
  userTenants: UserTenantWithRelations[];
}

export type UserWithRelations = User & UserRelations;
