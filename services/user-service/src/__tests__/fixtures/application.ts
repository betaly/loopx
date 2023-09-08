import {AuditDbSourceName} from '@bleco/audit-log';
import {AuthenticationComponent, Strategies} from '@bleco/authentication';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceSequence} from '@loopx/core';
import {UserDataSourceName} from '@loopx/user-core';
import {AclComponent} from 'loopback4-acl';
import {IntegrateMixin} from 'loopback4-plus';
import * as path from 'path';

import {UserServiceComponent} from '../../component';
import {UserServiceBindings} from '../../keys';
import {UserServiceComponentOptions} from '../../types';
import {BearerTokenVerifyProvider} from './bearer-token-verifier.provider';

export {ApplicationConfig};

export class UserServiceApplication extends IntegrateMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.configure<UserServiceComponentOptions>(UserServiceBindings.COMPONENT).to({});
    this.component(UserServiceComponent);
    // Add authentication component
    this.component(AuthenticationComponent);
    // Customize authentication verify handlers
    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(BearerTokenVerifyProvider);
    // Add authorization component
    this.component(AclComponent);
    this.sequence(ServiceSequence);

    this.bind(`datasources.${AuditDbSourceName}`).toAlias(`datasources.${UserDataSourceName}`);

    this.projectRoot = __dirname;
  }
}
