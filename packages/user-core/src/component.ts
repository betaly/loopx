import {Binding} from '@loopback/context';
import {Component, config, CoreBindings, inject, LifeCycleObserver, ServiceOrProviderClass} from '@loopback/core';
import {Class, DeepPartial, Model, Repository} from '@loopback/repository';
import {ApplicationWithGetService} from 'loopback4-plus';
import defaultsDeep from 'tily/object/defaultsDeep';

import {DEFAULT_SUPERADMIN_CREDENTIALS} from './defaults';
import {UserCoreBindings} from './keys';
import {models} from './models';
import {repositories} from './repositories';
import {AdminService, RoleService, services, TenantService} from './services';
import {UserCoreComponentOptions} from './types';

export class UserCoreComponent implements Component, LifeCycleObserver {
  readonly options: Required<UserCoreComponentOptions>;
  /**
   * An array of bindings to be added to the application context.
   *
   * @example
   * ```ts
   * const bindingX = Binding.bind('x').to('Value X');
   * this.bindings = [bindingX]
   * ```
   */
  bindings?: Binding[];

  /**
   * An array of service or provider classes
   */
  services?: ServiceOrProviderClass[];

  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];

  repositories?: Class<Repository<Model>>[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public readonly app: ApplicationWithGetService,
    @config()
    options: DeepPartial<UserCoreComponentOptions> = {},
  ) {
    this.options = defaultsDeep(options, {
      defaultUsernamePrefix: 'user_',
      superadminCredentials: DEFAULT_SUPERADMIN_CREDENTIALS,
    });

    this.app.bind(UserCoreBindings.DEFAULT_USERNAME_PREFIX).to(this.options.defaultUsernamePrefix);

    this.models = models;
    this.repositories = repositories;
    this.services = services;
  }

  async init() {
    const tenantService = await this.app.getService(TenantService);
    const roleService = await this.app.getService(RoleService);
    const adminService = await this.app.getService(AdminService);

    await tenantService.initTenants();
    await roleService.initRoles();
    await adminService.initAdministrators(this.options.superadminCredentials);
  }
}
