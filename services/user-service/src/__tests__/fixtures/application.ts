import {AuthenticationComponent, Strategies} from '@bleco/authentication';
import {AuthorizationBindings, AuthorizationComponent} from '@bleco/authorization';
import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {ServiceSequence} from '@loopx/core';
import * as path from 'path';

import {UserTenantServiceComponent} from '../../component';
import {UserTenantDataSourceName, UserTenantServiceBindings} from '../../keys';
import {UserTenantServiceComponentOptions} from '../../types';
import {BearerTokenVerifyProvider} from './bearer-token-verifier.provider';
import {AuditDbSourceName} from '@bleco/audit-log';

export {ApplicationConfig};

export class UserTenantServiceApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.configure<UserTenantServiceComponentOptions>(UserTenantServiceBindings.COMPONENT).to({
      // do not load services in component
      services: [],
    });
    this.component(UserTenantServiceComponent);
    // Add authentication component
    this.component(AuthenticationComponent);
    // Customize authentication verify handlers
    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(BearerTokenVerifyProvider);
    // Add authorization component
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer'],
    });
    this.sequence(ServiceSequence);
    this.component(AuthorizationComponent);

    this.bind(`datasources.${AuditDbSourceName}`).toAlias(`datasources.${UserTenantDataSourceName}`);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.[jt]s'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.[jt]s'],
        nested: true,
      },
    };
  }
}
