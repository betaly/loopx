import {AuditLogRepository} from './audit.repository';
import {AuthClientRepository} from './auth-client.repository';
import {GroupRepository} from './group.repository';
import {NonRestrictedUserViewRepository} from './non-restricted-user-view.repository';
import {RoleRepository} from './role.repository';
import {TenantRepository} from './tenant.repository';
import {TenantConfigRepository} from './tenant-config.repository';
import {UserRepository} from './user.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserGroupRepository} from './user-group.repository';
import {UserLevelPermissionRepository} from './user-level-permission.repository';
import {UserTenantRepository} from './user-tenant.repository';
import {UserTenantPrefsRepository} from './user-tenant-prefs.repository';
import {UserViewRepository} from './user-view.repository';

export * from './audit.repository';
export * from './auth-client.repository';
export * from './group.repository';
export * from './non-restricted-user-view.repository';
export * from './role.repository';
export * from './tenant.repository';
export * from './tenant-config.repository';
export * from './user.repository';
export * from './user-credentials.repository';
export * from './user-group.repository';
export * from './user-level-permission.repository';
export * from './user-tenant.repository';
export * from './user-tenant-prefs.repository';
export * from './user-view.repository';

export const repositories = [
  AuditLogRepository,
  AuthClientRepository,
  GroupRepository,
  NonRestrictedUserViewRepository,
  RoleRepository,
  TenantRepository,
  TenantConfigRepository,
  UserRepository,
  UserCredentialsRepository,
  UserGroupRepository,
  UserLevelPermissionRepository,
  UserTenantRepository,
  UserTenantPrefsRepository,
  UserViewRepository,
];
