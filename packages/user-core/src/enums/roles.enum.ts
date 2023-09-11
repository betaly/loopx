import {titleize} from 'inflection';

export enum DefaultRole {
  SuperAdmin = 'super_admin',
  Owner = 'owner',
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export interface RoleMapData {
  code: string;
  name: string;
}

export type RoleMap = {
  [key in string]: RoleMapData;
};

export const DefaultRoleMap: RoleMap = buildRoleMap(DefaultRole);

export function buildRoleMap(roles: Record<string, string>): RoleMap {
  const roleKeyMap: RoleMap = {};
  for (const key of Object.keys(roles)) {
    const name = roles[key];
    roleKeyMap[name] = {
      code: name,
      name: titleize(name),
    };
  }
  return roleKeyMap;
}
