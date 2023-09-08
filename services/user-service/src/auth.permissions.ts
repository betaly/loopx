import {IAuthTenantUser} from '@loopx/core';
import {DefaultRole, UserAuthSubjects} from '@loopx/user-core';
import {Actions, DefaultActions, Permissions} from 'loopback4-acl';

import {TenantActions} from './auth.actions';

export type UserAuthAbilities =
  | [DefaultActions, 'all']
  | [
      DefaultActions,
      (
        | UserAuthSubjects.User
        | UserAuthSubjects.UserTenant
        | UserAuthSubjects.AuthClient
        | UserAuthSubjects.UserTenantPrefs
      ),
    ]
  | [TenantActions, UserAuthSubjects.Tenant];

export type UserAuthPermissions = Permissions<DefaultRole, UserAuthAbilities, IAuthTenantUser>;

export const permissions: UserAuthPermissions = {
  everyone() {},

  [DefaultRole.Member]({user, can}) {
    can(Actions.create, UserAuthSubjects.Tenant);
    can(Actions.read, UserAuthSubjects.Tenant, {id: user.tenantId});

    can(Actions.manage, UserAuthSubjects.User, {id: user.id});

    can(Actions.read, UserAuthSubjects.UserTenantPrefs);

    // Members can manage their own UserTenant
    can(Actions.manage, UserAuthSubjects.UserTenant, {userId: user.id});

    // Members can read all UserTenants for their own tenant
    can(Actions.read, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});
  },

  [DefaultRole.Admin]({user, can, extend}) {
    extend(DefaultRole.Member);

    can(TenantActions.update, UserAuthSubjects.Tenant, {id: user.tenantId});
    can(TenantActions.manage, UserAuthSubjects.UserTenantPrefs, {userTenantId: user.userTenantId});

    // TODO: check this
    can(Actions.read, UserAuthSubjects.User, {tenantId: user.tenantId});

    can(Actions.create, UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: {$in: [DefaultRole.Member, DefaultRole.Admin]},
    });
    can(Actions.update, UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: {$in: [DefaultRole.Member, DefaultRole.Admin]},
    });
  },

  [DefaultRole.Owner]({user, can, extend}) {
    extend(DefaultRole.Admin);

    can(TenantActions.delete, UserAuthSubjects.Tenant, {id: user.tenantId});
    can(TenantActions.transfer, UserAuthSubjects.Tenant, {id: user.tenantId});

    can(Actions.manage, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});
  },

  [DefaultRole.SuperAdmin]({user, can}) {
    can(Actions.manage, 'all');
  },
};
