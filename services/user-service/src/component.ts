import {
  Application,
  Binding,
  Component,
  config,
  ContextTags,
  ControllerClass,
  CoreBindings,
  inject,
  injectable,
  ProviderMap,
} from '@loopback/core';
import {ServiceOrProviderClass} from '@loopback/core/dist/application';
import {Class, Model, Repository} from '@loopback/repository';
import {LxCoreComponent, matchResources} from '@loopx/core';

import {
  GroupController,
  HomePageController,
  PingController,
  RoleController,
  RoleUserTenantController,
  TenantController,
  TenantUserController,
  UserGroupController,
  UserGroupsController,
  UserSignupController,
  UserTenantController,
  UserTenantPrefsController,
} from './controllers';
import {UserTenantServiceBindings} from './keys';
import {
  AuditLog,
  AuthClient,
  AuthSecureClient,
  Group,
  GroupUserCountView,
  Role,
  Tenant,
  TenantConfig,
  User,
  UserCredentials,
  UserDto,
  UserGroup,
  UserLevelPermission,
  UserSignupCheckDto,
  UserTenant,
  UserTenantPrefs,
} from './models';
import {DefaultTenantProvider} from './providers';
import {
  AuditLogRepository,
  AuthClientRepository,
  AuthSecureClientRepository,
  GroupRepository,
  NonRestrictedUserViewRepository,
  RoleRepository,
  TenantConfigRepository,
  TenantRepository,
  UserCredentialsRepository,
  UserGroupCountViewRepository,
  UserGroupRepository,
  UserGroupViewRepository,
  UserLevelPermissionRepository,
  UserRepository,
  UserTenantPrefsRepository,
  UserTenantRepository,
  UserViewRepository,
} from './repositories';
import {AuthClientService, UserGroupHelperService, UserGroupService, UserOperationsService} from './services';
import {DEFAULT_USER_TENANT_SERVICE_OPTIONS, UserTenantServiceComponentOptions} from './types'; // Configure the binding for UserTenantServiceComponent

// Configure the binding for UserTenantServiceComponent
@injectable({
  tags: {[ContextTags.KEY]: UserTenantServiceBindings.COMPONENT},
})
export class UserTenantServiceComponent implements Component {
  repositories?: Class<Repository<Model>>[];

  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];

  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];
  bindings?: Binding[] = [];
  providers?: ProviderMap = {};
  services?: ServiceOrProviderClass[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: Application,
    @config()
    private readonly options: UserTenantServiceComponentOptions = DEFAULT_USER_TENANT_SERVICE_OPTIONS,
  ) {
    this.bindings = [];
    if (!this.application.isBound(`${CoreBindings.COMPONENTS}.${LxCoreComponent.name}`)) {
      this.application.component(LxCoreComponent);
    }
    this.models = [
      AuditLog,
      AuthClient,
      AuthSecureClient,
      GroupUserCountView,
      Group,
      Role,
      TenantConfig,
      Tenant,
      UserCredentials,
      UserDto,
      UserGroup,
      UserLevelPermission,
      UserSignupCheckDto,
      UserTenantPrefs,
      UserTenant,
      User,
    ];
    this.repositories = [
      AuditLogRepository,
      AuthClientRepository,
      AuthSecureClientRepository,
      UserGroupCountViewRepository,
      GroupRepository,
      NonRestrictedUserViewRepository,
      RoleRepository,
      TenantConfigRepository,
      TenantRepository,
      UserCredentialsRepository,
      UserGroupViewRepository,
      UserGroupRepository,
      UserLevelPermissionRepository,
      UserTenantPrefsRepository,
      UserTenantRepository,
      UserViewRepository,
      UserRepository,
    ];
    this.providers = {
      [UserTenantServiceBindings.DEFAULT_TENANT.key]: DefaultTenantProvider,
    };
    this.controllers = matchResources(
      [
        GroupController,
        HomePageController,
        PingController,
        RoleUserTenantController,
        RoleController,
        TenantUserController,
        TenantController,
        UserGroupController,
        UserGroupsController,
        UserSignupController,
        UserTenantPrefsController,
        UserTenantController,
      ],
      options?.controllers,
    );
    this.services = matchResources(
      [AuthClientService, UserGroupService, UserGroupHelperService, UserOperationsService],
      options?.services,
    );
  }
}
