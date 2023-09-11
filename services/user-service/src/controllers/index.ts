import {HomePageController} from './home-page.controller';
import {PingController} from './ping.controller';
import {RoleUserTenantController} from './role-user-tenant.controller';
import {TenantUserController} from './tenant-user.controller';
import {TenantController} from './tenant.controller';
import {UserSignupController} from './user-signup.controller';
import {UserTenantController} from './user-tenant.controller';
import {UserTenantPrefsController} from './user-tenant-prefs.controller';

export * from './home-page.controller';
export * from './ping.controller';
export * from './role-user-tenant.controller';
export * from './tenant.controller';
export * from './tenant-user.controller';
export * from './user-signup.controller';
export * from './user-tenant.controller';
export * from './user-tenant-prefs.controller';

export const controllers = [
  HomePageController,
  PingController,
  RoleUserTenantController,
  TenantUserController,
  TenantController,
  UserSignupController,
  UserTenantPrefsController,
  UserTenantController,
];
