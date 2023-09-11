import {IAuthTenantUser} from '@loopx/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {DefaultRole} from '@loopx/user-core';
import {DefaultActions, Permissions} from 'loopback4-acl';

import {AuthenticationAuthActions} from './auth.actions';
import {AuthenticationAuthSubjects} from './auth.subjects';

export type AuthenticationAuthAbilities =
  | [DefaultActions, 'all']
  | [AuthenticationAuthActions, AuthenticationAuthSubjects.LoginActivity];

export type AuthenticationAuthPermissions = Permissions<DefaultRole, AuthenticationAuthAbilities, IAuthTenantUser>;

export const permissions: AuthenticationAuthPermissions = {
  [DefaultRole.SuperAdmin]({user, can}) {
    if (user.tenantId !== DEFAULT_TENANT_CODE) return;

    can(AuthenticationAuthActions.manage, AuthenticationAuthSubjects.LoginActivity);
  },
};
