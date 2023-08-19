import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import path from 'path';

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';

import {AuthorizationBindings, UserPermissionsProvider} from '@bleco/authorization';
import '@bleco/boot';
import {HelmetSecurityBindings} from '@bleco/helmet';
import {RateLimitSecurityBindings} from '@bleco/ratelimiter';

import {
  AuthCacheSourceName,
  AuthDbSourceName,
  AuthenticationServiceComponent,
  AuthServiceBindings,
} from '@loopx/authentication-service';
import {CoreComponent, LxCoreBindings, SECURITY_SCHEME_SPEC} from '@loopx/core';

import {KvDataSource} from './datasources';
import * as openapi from './openapi.json';
import {UserTenantServiceComponent, UserTenantServiceComponentBindings} from '@loopx/user-service';
import {AuthenticationBindings} from '@bleco/authentication';
import {MySequence} from './sequence';
import {version} from './version';

export {ApplicationConfig};

const port = 3000;

export const AUthControllers = [
  'LoginController',
  'LogoutController',
  'TokensController',
  'AuthaLoginController',
  'AuthClientsController',
];

export class AuthExampleApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    dotenv.config();
    if (process.env.NODE_ENV !== 'test') {
      dotenvExt.load({
        schema: '.env.schema',
        errorOnMissing: true,
        includeProcessEnv: true,
      });
    } else {
      dotenvExt.load({
        schema: '.env.schema',
        errorOnMissing: false,
        includeProcessEnv: true,
      });
    }

    options.rest = options.rest || {};
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.host = process.env.HOST;
    super(options);

    this.sequence(MySequence);

    this.bind(`datasources.${AuthDbSourceName}`).toAlias('datasources.db');
    this.bind(`datasources.${AuthCacheSourceName}`).toAlias('datasources.kv');

    const enableObf = !!+(process.env.ENABLE_OBF ?? 1);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    const swaggerUsername = process.env.SWAGGER_USERNAME ?? 'test';
    const swaggerPassword = process.env.SWAGGER_PASSWORD ?? 'test';
    this.bind(LxCoreBindings.config).to({
      openapiSpec: openapi,
      enableObf,
      obfPath: '/obf',
      authentication: true,
      swaggerUsername: swaggerUsername,
      swaggerPassword: swaggerPassword,
    });
    this.component(CoreComponent);

    this.bind(AuthenticationBindings.CONFIG).to({
      secureClient: true,
    });
    this.bind(AuthServiceBindings.Config).to({
      useCustomSequence: true,
      controllers: AUthControllers,
    });
    this.component(AuthenticationServiceComponent);

    this.configure(UserTenantServiceComponentBindings.COMPONENT).to({
      controllers: ['*', '!UserSignupController'],
    });
    this.component(UserTenantServiceComponent);

    this.bind(RateLimitSecurityBindings.CONFIG).to({
      ds: KvDataSource,
      points: parseInt((process.env.RATE_LIMITER_POINTS as string) ?? 4),
      duration: parseInt((process.env.RATE_LIMITER_DURATION as string) ?? 1),
      key: req => req.ip,
    });

    this.bind(HelmetSecurityBindings.CONFIG).to({
      frameguard: {action: process.env.X_FRAME_OPTIONS as any},
    });

    this.bind(AuthorizationBindings.USER_PERMISSIONS).toProvider(UserPermissionsProvider);

    this.component(RestExplorerComponent);

    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Auth Example API',
        version,
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      servers: [{url: '/'}],
    });

    this.projectRoot = __dirname;
  }
}
