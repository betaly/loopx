import {IAuthTenantUser} from '@loopx/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {Roles, UserAuthSubjects} from '@loopx/user-core';
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

export type UserAuthPermissions = Permissions<Roles, UserAuthAbilities, IAuthTenantUser>;

export const permissions: UserAuthPermissions = {
  everyone() {},

  [Roles.User]({user, can}) {
    can(Actions.manage, UserAuthSubjects.User, {id: user.id});

    can(Actions.create, UserAuthSubjects.Tenant);
    can(Actions.read, UserAuthSubjects.Tenant, {id: user.tenantId});

    can(TenantActions.manage, UserAuthSubjects.UserTenantPrefs, {userTenantId: user.userTenantId});

    // Members can read all UserTenants for their own tenant
    can(Actions.read, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});

    // Members can manage their own UserTenant
    can(Actions.manage, UserAuthSubjects.UserTenant, {tenantId: user.tenantId, userId: user.id});
  },

  [Roles.Admin]({user, can, extend}) {
    extend(Roles.User);

    can(Actions.read, UserAuthSubjects.User, {tenantId: user.tenantId});

    can(TenantActions.update, UserAuthSubjects.Tenant, {id: user.tenantId});

    can([Actions.create, Actions.update], UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      roleId: Roles.User,
    });

    can([Actions.create, Actions.update], UserAuthSubjects.UserTenant, {
      tenantId: user.tenantId,
      role: Roles.User,
    });
  },

  [Roles.Owner]({user, can, extend}) {
    extend(Roles.Admin);

    can(TenantActions.delete, UserAuthSubjects.Tenant, {id: user.tenantId});
    can(TenantActions.transfer, UserAuthSubjects.Tenant, {id: user.tenantId});

    can(Actions.manage, UserAuthSubjects.UserTenant, {tenantId: user.tenantId});
  },

  [Roles.SuperAdmin]({user, can}) {
    // Deny all actions if user is not in default tenant
    if (user.tenantId !== DEFAULT_TENANT_CODE) return;

    // SuperAdmin can manage all UserAuthSubjects
    for (const subject of Object.values(UserAuthSubjects)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      can(Actions.manage, subject as any);
    }
  },
};
