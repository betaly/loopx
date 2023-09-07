import {IAuthTenantUser} from '@loopx/core';
import {buildAbilityForUser, CaslAble} from 'loopback4-acl';

import {RoleKey} from '../enums';
import {User, UserTenant} from '../models';
import {UserAuthPermissions} from '../permissions';

export function toAuthorizedUser(user: User, ut: UserTenant): IAuthTenantUser {
  return {
    ...user,
    ...ut,
    id: user.id!,
    name: user.name,
    role: ut.roleId as RoleKey,
    authClientId: 0,
  };
}

export async function defineAble(user: User, ut: UserTenant, permissions: UserAuthPermissions) {
  const u = toAuthorizedUser(user, ut);
  const ability = await buildAbilityForUser<string>(u, permissions);
  return new CaslAble(ability, u);
}
