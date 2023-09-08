import {IAuthTenantUser} from '@loopx/core';
import {buildAbilityForUser, CaslAble} from 'loopback4-acl';

import {User, UserTenant} from '../models';
import {UserCorePermissions} from './fixtures/permissions';

export function toAuthorizedUser(user: User, ut: UserTenant): IAuthTenantUser {
  return {
    ...user,
    ...ut,
    id: user.id!,
    name: user.name,
    role: ut.roleId,
    authClientId: 0,
  };
}

export async function defineAble(user: User, ut: UserTenant, permissions: UserCorePermissions) {
  const u = toAuthorizedUser(user, ut);
  const ability = await buildAbilityForUser<string>(u, permissions);
  return new CaslAble(ability, u);
}
