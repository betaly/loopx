import {HelmetComponent} from '@bleco/helmet';
import {RateLimiterComponent} from '@bleco/ratelimiter';
import {Binding, Component, CoreBindings, createBindingFromClass, inject, ProviderMap} from '@loopback/core';
import {ExpressRequestHandler, RestApplication, RestBindings} from '@loopback/rest';
import {configure} from 'i18n';
import * as swstats from 'swagger-stats';

import {LoggerExtensionComponent, SwaggerAuthenticationComponent} from './components';
import {OperationSpecEnhancer} from './enhancer/operation-spec-enhancer';
import {LocaleKey} from './enums';
import {LxCoreBindings, OASBindings} from './keys';
import {LxCoreConfig} from './types';

export class LxCoreComponent implements Component {
  localeObj: i18nAPI = {} as i18nAPI;
  providers?: ProviderMap = {};
  bindings: Binding[] = [];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(LxCoreBindings.config, {optional: true})
    private readonly coreOptions: LxCoreConfig,
    @inject(LxCoreBindings.EXPRESS_MIDDLEWARES, {optional: true})
    private readonly expressMiddlewares: ExpressRequestHandler[],
  ) {
    const middlewares = [];
    if (this.expressMiddlewares) {
      middlewares.push(...this.expressMiddlewares);
    }

    // Mount logger component
    this.application.component(LoggerExtensionComponent);

    this.application.component(HelmetComponent);
    this.application.component(RateLimiterComponent);

    // Enable OBF
    if (this.coreOptions?.enableObf && this.coreOptions?.openapiSpec) {
      const middlewareConfig = Object.assign(this.coreOptions.swaggerStatsConfig ?? {}, {
        name: this.coreOptions?.name,
        uriPath: this.coreOptions?.obfPath ?? `/obf`,
        swaggerSpec: this.coreOptions?.openapiSpec,
        authentication: this.coreOptions.authentication ?? false,
      });
      const swStatsMiddleware = swstats.getMiddleware({
        ...middlewareConfig,
        onAuthenticate: this.coreOptions.swaggerAuthenticate
          ? this.coreOptions.swaggerAuthenticate
          : (req, username, password) => {
              return username === this.coreOptions.swaggerUsername && password === this.coreOptions.swaggerPassword;
            },
      });
      middlewares.push(swStatsMiddleware);
    }

    if (this.coreOptions?.authenticateSwaggerUI) {
      this.application.component(SwaggerAuthenticationComponent);
    }

    // Configure locale provider
    if (this.coreOptions?.configObject) {
      configure({...this.coreOptions.configObject, register: this.localeObj});
    } else {
      configure({
        locales: [LocaleKey.en, LocaleKey.es, LocaleKey.ptBr, LocaleKey.ptPt, LocaleKey.esCo],
        fallbacks: {
          [LocaleKey.es]: 'en',
          [LocaleKey.esCo]: 'en',
          [LocaleKey.ptBr]: 'en',
          [LocaleKey.ptPt]: 'en',
        },
        register: this.localeObj,
        directoryPermissions: '777',
        directory: `${__dirname}/../locales`,
        // sonarignore:start
        /* eslint-disable @typescript-eslint/no-explicit-any */
        objectNotation: '->' as any,
        // sonarignore:end
      });
    }

    // Configure error writer options
    if (!this.application.isBound(RestBindings.ERROR_WRITER_OPTIONS)) {
      this.application.bind(RestBindings.ERROR_WRITER_OPTIONS).to({
        safeFields: ['code', 'errorCode', 'data'],
      });
    }

    this.application.bind(LxCoreBindings.EXPRESS_MIDDLEWARES).to(middlewares);
    this.bindings.push(Binding.bind(OASBindings.HiddenEndpoint).to([]));
    this.bindings.push(Binding.bind(LxCoreBindings.i18n).to(this.localeObj));
    this.application.add(createBindingFromClass(OperationSpecEnhancer));
    this.application.bind(LxCoreBindings.DEFAULT_TENANT_KEY).to(this.coreOptions?.defaultTenantKey ?? 'default');
  }
}
