import {Component, CoreBindings} from '@loopback/core';
import {models} from './models';
import {repositories} from './repositories';
import {
  AuthCacheSourceName,
  AuthDbSourceName,
  AuthenticationServiceComponent,
  AuthServiceBindings,
  SignUpBindings,
} from '@loopx/authentication-service';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {LxCoreBindings, LxCoreComponent} from '@loopx/core';
import * as openapi from './openapi.json';
import {UserCoreBindings, UserCoreComponentOptions} from '@loopx/user-core';
import {AuthenticationBindings} from '@bleco/authentication';
import {AuthaSignupProvider, LocalSignupProvider} from './providers';
import {UserServiceBindings, UserServiceComponent} from '@loopx/user-service';
import {RateLimitSecurityBindings} from '@bleco/ratelimiter';
import {DbDatasource, KvDataSource} from './datasources';
import {HelmetSecurityBindings} from '@bleco/helmet';
import {inject} from '@loopback/context';
import {ApplicationWithRepositories} from '@loopback/repository';
import {controllers} from './controllers';
import {Seeder} from './observers/seeder.observer';

export const AUthControllers = [
  'LoginController',
  'LogoutController',
  'TokensController',
  'AuthaLoginController',
  'AuthClientsController',
  'LoginActivityController',
];

export class AuthExampleComponent implements Component {
  models = models;
  repositories = repositories;
  controllers = controllers;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly app: ApplicationWithRepositories,
  ) {
    app.lifeCycleObserver(Seeder);

    app.dataSource(KvDataSource);
    app.dataSource(DbDatasource);

    app.bind(`datasources.${AuthDbSourceName}`).toAlias('datasources.db');
    app.bind(`datasources.${AuthCacheSourceName}`).toAlias('datasources.kv');

    const enableObf = !!+(process.env.ENABLE_OBF ?? 1);

    // Customize @loopback/rest-explorer configuration here
    app.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    const swaggerUsername = process.env.SWAGGER_USERNAME ?? 'test';
    const swaggerPassword = process.env.SWAGGER_PASSWORD ?? 'test';
    app.bind(LxCoreBindings.config).to({
      openapiSpec: openapi,
      enableObf,
      obfPath: '/obf',
      authentication: true,
      swaggerUsername: swaggerUsername,
      swaggerPassword: swaggerPassword,
    });
    app.component(LxCoreComponent);

    // Configure UserCoreComponent
    app.configure<UserCoreComponentOptions>(UserCoreBindings.COMPONENT).to({
      superadminCredentials: {
        identifier: process.env.SUPERADMIN_USERNAME!,
        password: process.env.SUPERADMIN_PASSWORD!,
      },
    });

    // AuthenticationServiceComponent
    app.bind(AuthenticationBindings.CONFIG).to({
      secureClient: true,
    });
    app.bind(AuthServiceBindings.Config).to({
      useCustomSequence: true,
      controllers: AUthControllers,
    });
    app.component(AuthenticationServiceComponent);
    app.bind(SignUpBindings.LOCAL_SIGNUP_PROVIDER).toProvider(LocalSignupProvider);
    app.bind(SignUpBindings.AUTHA_SIGNUP_PROVIDER).toProvider(AuthaSignupProvider);

    // UserServiceComponent
    app.configure(UserServiceBindings.COMPONENT).to({
      controllers: ['*', '!UserSignupController'],
    });
    app.component(UserServiceComponent);

    // RateLimit configuration (in LxCoreComponent)
    app.bind(RateLimitSecurityBindings.CONFIG).to({
      ds: KvDataSource,
      points: parseInt((process.env.RATE_LIMITER_POINTS as string) ?? 4),
      duration: parseInt((process.env.RATE_LIMITER_DURATION as string) ?? 1),
      key: ({request}) => request.ip,
    });

    // Helmet configuration (in LxCoreComponent)
    app.bind(HelmetSecurityBindings.CONFIG).to({
      frameguard: {action: process.env.X_FRAME_OPTIONS as any},
    });

    // Bind user permissions provider
    // app.bind(AuthorizationBindings.USER_PERMISSIONS).toProvider(UserPermissionsProvider);

    // RestExplorerComponent
    app.component(RestExplorerComponent);
  }
}
