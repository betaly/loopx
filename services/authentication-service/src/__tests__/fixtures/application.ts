import {AuthenticationBindings} from '@bleco/authentication';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {IntegrateMixin} from 'loopback4-plus';
import * as path from 'path';

import {AuthenticationServiceComponent} from '../../component';
import {AuthServiceBindings} from '../../keys';
import {SignUpBindings} from '../../providers';
import {
  AuthaSignupProvider,
  TestForgotPasswordTokenHandlerProvider,
  TestLocalSignupProvider,
  TestSignupTokenHandlerProvider,
} from './providers';
import {TestHelperService} from './services';

export {ApplicationConfig};

export class TestingApplication extends IntegrateMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.bind(AuthenticationBindings.CONFIG).to({
      secureClient: true,
    });
    this.component(AuthenticationServiceComponent);

    // Customize authentication verify handlers
    this.bind(SignUpBindings.SIGNUP_HANDLER_PROVIDER).toProvider(TestSignupTokenHandlerProvider);
    this.bind(SignUpBindings.LOCAL_SIGNUP_PROVIDER).toProvider(TestLocalSignupProvider);
    this.bind(SignUpBindings.AUTHA_SIGNUP_PROVIDER).toProvider(AuthaSignupProvider);
    this.bind(AuthServiceBindings.ForgotPasswordHandler).toProvider(TestForgotPasswordTokenHandlerProvider);
    this.service(TestHelperService, {defaultScope: BindingScope.SINGLETON});

    this.projectRoot = __dirname;
  }
}
