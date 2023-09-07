import {IAuthTenantUser} from '@loopx/core';
import {Actions, Permissions} from 'loopback4-acl';

import {RoleKey} from './enums';

export type UserAuthSubjects = 'UserTenant';

export type UserAuthPermissions = Permissions<RoleKey, [Actions, UserAuthSubjects], IAuthTenantUser>;

export const permissions: UserAuthPermissions = {
  everyone() {},

  [RoleKey.Member]({user, can}) {
    // Members can manage their own UserTenant
    can(Actions.manage, 'UserTenant', {userId: user.id});

    // Members can read all UserTenants for their own tenant
    can(Actions.read, 'UserTenant', {tenantId: user.tenantId});
  },

  [RoleKey.Admin]({user, can, extend}) {
    // Extend member permissions
    extend(RoleKey.Member);

    can(Actions.manage, 'UserTenant', {tenantId: user.tenantId, roleKey: {$in: [RoleKey.Member, RoleKey.Admin]}});
  },

  [RoleKey.Owner]({user, can, extend}) {
    // Extend member permissions
    extend(RoleKey.Admin);

    can(Actions.manage, 'UserTenant', {tenantId: user.tenantId});
  },
};
