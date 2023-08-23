import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {IUserPrefs, ModelTypes, UserStatus, UserUpdatableEntity} from '@loopx/core';

import {Role, RoleWithRelations} from './role.model';
import {Tenant, TenantWithRelations} from './tenant.model';
import {User, UserWithRelations} from './user.model';
import {UserLevelPermission} from './user-level-permission.model';

@model({
  name: 'user_tenants',
})
export class UserTenant extends UserUpdatableEntity implements IUserPrefs {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property({
    type: 'number',
    jsonSchema: {
      maximum: 12,
      minimum: 0,
    },
  })
  status?: UserStatus;

  @property({
    type: 'string',
  })
  locale?: string;

  @belongsTo(
    () => Tenant,
    {keyFrom: 'tenant_id', name: 'tenant'},
    {
      name: 'tenant_id',
      required: true,
    },
  )
  tenantId: string;

  @belongsTo(
    () => User,
    {keyFrom: 'user_id', name: 'user'},
    {
      name: 'user_id',
      required: true,
    },
  )
  userId: string;

  @belongsTo(
    () => Role,
    {keyFrom: 'role_id', name: 'role'},
    {
      name: 'role_id',
      required: true,
    },
  )
  roleId: string;

  @hasMany(() => UserLevelPermission, {keyTo: 'userTenantId'})
  userLevelPermissions: UserLevelPermission[];

  constructor(data?: Partial<UserTenant>) {
    super(data);
  }
}

export interface UserTenantRelations {
  user: UserWithRelations;
  tenant: TenantWithRelations;
  role: RoleWithRelations;
}

export type UserTenantWithRelations = UserTenant & UserTenantRelations;

export type UserTenantTypes = ModelTypes<UserTenant, typeof UserTenant.prototype.id, UserTenantRelations>;
