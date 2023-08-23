import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';

import {AuthenticationServiceComponent} from './component';
import {AuthenticationBindings} from './keys';

export {ApplicationConfig};

export class AuthenticationServiceApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.static('/', path.join(__dirname, '../public'));
    this.bind(AuthenticationBindings.CONFIG).to({
      secureClient: true,
    });
    this.component(AuthenticationServiceComponent);

    this.projectRoot = __dirname;
  }
}
