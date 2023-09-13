// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {DataObject, Inclusion, Model, model, property} from '@loopback/repository';
import {Gender, UserStatus, UserUpdatableEntity} from '@loopx/core';

import {Role} from './role.model';
import {Tenant} from './tenant.model';
import {User, UserWithRelations} from './user.model';
import {UserTenant, UserTenantRelations, UserTenantWithRelations} from './user-tenant.model';

type IUserWithoutRelations = Omit<Omit<User, keyof UserUpdatableEntity>, 'credentials' | 'userTenants'>;

@model()
export class UserView<T = DataObject<Model>>
  extends UserUpdatableEntity<T & UserView>
  implements IUserWithoutRelations
{
  static readonly InclusionsForUser: Inclusion[] = [
    {
      relation: 'userTenants',
      scope: {
        include: [
          {
            relation: 'role',
            scope: {
              fields: ['name', 'code'],
            },
          },
          {
            relation: 'tenant',
            scope: {
              fields: ['name', 'code'],
            },
          },
        ],
      },
    },
  ];

  static readonly InclusionsForUserTenant: Inclusion[] = [
    {
      relation: 'role',
      scope: {
        fields: ['code'],
      },
    },
    {
      relation: 'user',
    },
    {
      relation: 'tenant',
      scope: {
        fields: ['name', 'code'],
      },
    },
  ];

  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'string',
    name: 'middle_name',
  })
  name?: string;
  @property({
    type: 'string',
    required: true,
  })
  username: string;
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
  })
  designation?: string;
  @property({
    type: 'string',
  })
  phone?: string;
  @property({
    type: 'array',
    itemType: 'number',
    name: 'auth_client_ids',
  })
  authClientIds?: number[];
  @property({
    name: 'last_login',
    type: 'string',
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
    jsonSchema: {
      nullable: true,
    },
  })
  dob?: Date;
  @property({
    type: 'string',
    name: 'default_tenant_id',
    required: true,
  })
  defaultTenantId: string;
  @property({
    type: 'number',
    jsonSchema: {
      maximum: 11,
      minimum: 0,
    },
  })
  status?: UserStatus;
  @property({
    type: 'string',
    name: 'tenant_id',
    required: true,
  })
  tenantId: string;
  @property({
    type: 'string',
    name: 'role_id',
    required: true,
  })
  roleId: string;
  @property({
    name: 'name',
    type: 'string',
    required: true,
  })
  tenantName: string;
  @property({
    name: 'key',
    type: 'string',
  })
  tenantCode?: string;
  @property({
    name: 'role_name',
    type: 'string',
  })
  roleName?: string;
  @property({
    name: 'role_code',
    type: 'string',
  })
  roleCode?: string;
  @property({
    name: 'user_tenant_id',
    type: 'string',
    required: true,
  })
  userTenantId: string;
  @property({
    type: 'date',
    name: 'expires_on',
  })
  expiresOn?: Date;

  static fromUsers(users: UserWithRelations[]): UserView[] {
    return users.map((user: UserWithRelations) => this.fromUser(user)).filter(u => !!u) as unknown as UserView[];
  }

  static fromUser(user: UserWithRelations): UserView[] | undefined;
  static fromUser(user: UserWithRelations, forOne: true): UserView | undefined;
  static fromUser(user: UserWithRelations, forOne?: boolean): UserView | UserView[] | undefined {
    if (!user?.userTenants?.length) {
      return;
    }

    const uts = user.userTenants.filter((ut: UserTenantRelations) => ut.tenant && ut.role);
    if (!uts.length) {
      return;
    }

    if (forOne) {
      return this.from(uts[0], user, uts[0].tenant, uts[0].role);
    } else {
      return uts.map((ut: UserTenantWithRelations) => this.from(ut, user, ut.tenant, ut.role));
    }
  }

  static from(
    ut: Pick<UserTenant, 'id' | 'tenantId' | 'roleId'>,
    user: User,
    tenant: Pick<Tenant, 'name' | 'code'>,
    role: Pick<Role, 'name' | 'code'>,
  ): UserView {
    const data = {
      ...user,
      tenantId: ut.tenantId,
      tenantName: tenant.name,
      tenantCode: tenant.code,
      roleId: ut.roleId,
      roleName: role.name,
      roleCode: role.code,
      userTenantId: ut.id,
    };
    return new UserView(data);
  }
}
