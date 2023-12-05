import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import path from 'path';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import '@bleco/boot';
import {SECURITY_SCHEME_SPEC} from '@loopx/core';
import {MySequence} from './sequence';
import {version} from './version';
import {GetServiceMixin} from 'loopback4-plus';
import {AuthExampleComponent} from './component';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';

export {ApplicationConfig};

const port = 3000;

export class AuthExampleApplication extends GetServiceMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
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

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.component(AuthExampleComponent);

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
  }
}
