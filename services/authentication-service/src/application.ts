import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {IntegrateMixin} from 'loopback4-plus';
import * as path from 'path';

import {AuthenticationServiceComponent} from './component';
import {AuthenticationBindings} from './keys';

export {ApplicationConfig};

export class AuthenticationServiceApplication extends IntegrateMixin(RestApplication) {
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
