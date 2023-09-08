import {AuthClientService} from './auth-client.service';
import {RoleService} from './role.service';
import {TenantService} from './tenant.service';
import {UserGroupService} from './user-group.service';
import {UserGroupHelperService} from './user-group-helper.service';
import {UserOperationsService} from './user-operations.service';

export * from './auth-client.service';
export * from './role.service';
export * from './tenant.service';
export * from './user-group.service';
export * from './user-group-helper.service';
export * from './user-operations.service';

export const services = [
  AuthClientService,
  UserGroupHelperService,
  UserGroupService,
  UserOperationsService,
  RoleService,
  TenantService,
];
