﻿import {AuditLog} from './audit.model';
import {AuthClient} from './auth-client.model';
import {Group} from './group.model';
import {Role} from './role.model';
import {Tenant} from './tenant.model';
import {TenantConfig} from './tenant-config.model';
import {TenantUserView} from './tenant-user.view';
import {User} from './user.model';
import {UserCredentials} from './user-credentials.model';
import {UserGroup} from './user-group.model';
import {UserLevelPermission} from './user-level-permission.model';
import {UserTenant} from './user-tenant.model';
import {UserTenantPrefs} from './user-tenant-prefs.model';

export * from './audit.model';
export * from './auth-client.model';
export * from './group.model';
export * from './role.model';
export * from './tenant.model';
export * from './tenant-config.model';
export * from './tenant-user.data';
export * from './tenant-user.view';
export * from './user.model';
export * from './user-credentials.model';
export * from './user-group.model';
export * from './user-level-permission.model';
export * from './user-tenant.model';
export * from './user-tenant-prefs.model';

export const models = [
  AuditLog,
  AuthClient,
  Group,
  Role,
  Tenant,
  TenantConfig,
  User,
  UserCredentials,
  TenantUserView,
  UserGroup,
  UserLevelPermission,
  UserTenant,
  UserTenantPrefs,
];
