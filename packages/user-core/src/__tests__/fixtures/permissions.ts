import {IAuthTenantUser} from '@loopx/core';
import {Actions, DefaultActions, Permissions} from 'loopback4-acl';

import {DefaultRole} from '../../enums';
import {UserAuthSubjects} from '../../subjects';

export type UserCoreAbilities = [DefaultActions, 'all'] | [DefaultActions, UserAuthSubjects.UserTenant];
export type UserCorePermissions = Permissions<DefaultRole, UserCoreAbilities, IAuthTenantUser>;

export const permissions: UserCorePermissions = {
  everyone() {},

  [DefaultRole.User]({user, can}) {
    // Members can manage their own UserTenant
    can(Actions.manage, UserAuthSubjects.UserTenant, {userId: user.id});

    // Members can read all UserTenants for their own tenant
    can(Actions.read, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});
  },

  [DefaultRole.Admin]({user, can, extend}) {
    // Extend user permissions
    extend(DefaultRole.User);

    can(Actions.create, UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: {$in: [DefaultRole.User, DefaultRole.Admin]},
    });
    can(Actions.read, UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: {$in: [DefaultRole.User, DefaultRole.Admin]},
    });
    can(Actions.update, UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: {$in: [DefaultRole.User, DefaultRole.Admin]},
    });
  },

  [DefaultRole.Owner]({user, can, extend}) {
    // Extend user permissions
    extend(DefaultRole.Admin);

    can(Actions.manage, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});
  },

  [DefaultRole.SuperAdmin]({user, can}) {
    can(Actions.manage, 'all');
  },
};
