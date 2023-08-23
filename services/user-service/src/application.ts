import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';

import {UserTenantServiceComponent} from './component';
import {UserTenantServiceBindings} from './keys';
import {UserTenantServiceComponentOptions} from './types';

export {ApplicationConfig};

export class UserTenantServiceApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.static('/', path.join(__dirname, '../public'));
    this.configure<UserTenantServiceComponentOptions>(UserTenantServiceBindings.COMPONENT).to({
      services: [],
    });
    this.component(UserTenantServiceComponent);

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.[jt]s'],
        nested: true,
      },
    };
  }
}
