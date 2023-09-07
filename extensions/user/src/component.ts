import {Binding} from '@loopback/context';
import {Component, config, ServiceOrProviderClass} from '@loopback/core';
import {Class, Model, Repository} from '@loopback/repository';
import {createBindingFromPermissions} from 'loopback4-acl';

import {models} from './models';
import {permissions} from './permissions';
import {repositories} from './repositories';
import {services} from './services';
import {UserComponentOptions} from './types';

export class UserComponent implements Component {
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
    @config()
    public readonly options: UserComponentOptions = {},
  ) {
    this.bindings = [createBindingFromPermissions(permissions, 'user-tenant')];
    this.models = models;
    this.repositories = repositories;
    this.services = services;
  }
}
