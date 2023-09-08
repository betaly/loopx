import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import * as path from 'path';

import {UserServiceComponent} from './component';
import {UserServiceBindings} from './keys';
import {UserServiceComponentOptions} from './types';

export {ApplicationConfig};

export class UserServiceApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.static('/', path.join(__dirname, '../public'));
    this.configure<UserServiceComponentOptions>(UserServiceBindings.COMPONENT).to({
      //
    });
    this.component(UserServiceComponent);

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
