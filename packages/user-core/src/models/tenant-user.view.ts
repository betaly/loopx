import {model, property} from '@loopback/repository';
import {CoreModel, UserStatus} from '@loopx/core';

import {User} from './user.model';
import {UserTenant} from './user-tenant.model';

@model()
export class TenantUserView extends CoreModel<TenantUserView> {
  @property({
    type: 'string',
    required: true,
  })
  userTenantId: string;

  @property({
    type: 'string',
    required: true,
  })
  tenantId: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  roleId: string;

  @property({
    type: 'number',
  })
  status?: UserStatus;

  @property({
    type: 'string',
  })
  authProvider?: string;

  @property(() => User)
  userDetails: User;

  static fromUserTenantAndUser(userTenant: UserTenant, user: User, data?: Partial<TenantUserView>): TenantUserView {
    return new TenantUserView({
      userTenantId: userTenant.id,
      tenantId: userTenant.tenantId,
      userId: userTenant.userId,
      roleId: userTenant.roleId,
      status: userTenant.status,
      userDetails: user,
      ...data,
    });
  }
}
