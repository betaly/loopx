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
  ServiceOrProviderClass,
} from '@loopback/core';
import {Class, Model, Repository} from '@loopback/repository';
import {LxCoreComponent, matchResources} from '@loopx/core';
import {UserCoreComponent} from '@loopx/user-core';
import {createBindingFromPermissions} from 'loopback4-acl';

import {permissions} from './auth.permissions';
import {controllers} from './controllers';
import {UserServiceBindings} from './keys';
import {DefaultTenantProvider} from './providers';
import {DEFAULT_USER_TENANT_SERVICE_OPTIONS, UserServiceComponentOptions} from './types';

// Configure the binding for UserServiceComponent
@injectable({
  tags: {[ContextTags.KEY]: UserServiceBindings.COMPONENT},
})
export class UserServiceComponent implements Component {
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
    private readonly options: UserServiceComponentOptions = DEFAULT_USER_TENANT_SERVICE_OPTIONS,
  ) {
    this.bindings = [createBindingFromPermissions(permissions, 'user-service')];
    if (!this.application.isBound(`${CoreBindings.COMPONENTS}.${LxCoreComponent.name}`)) {
      this.application.component(LxCoreComponent);
    }
    this.application.component(UserCoreComponent);
    this.providers = {
      [UserServiceBindings.DEFAULT_TENANT.key]: DefaultTenantProvider,
    };
    this.controllers = matchResources(controllers, this.options?.controllers);
  }
}
