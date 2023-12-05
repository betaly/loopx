import {ApplicationConfig, CoreBindings, inject, LifeCycleObserver, lifeCycleObserver, service} from '@loopback/core';

import {ClientType} from '@bleco/authentication';

import {ILogger, LOGGER} from '@loopx/core';
import {AuthClientService} from '@loopx/user-core';

@lifeCycleObserver('seeder')
export class Seeder implements LifeCycleObserver {
  logger: ILogger;
  constructor(
    @inject(LOGGER.LOGGER_INJECT) logger: ILogger,
    @service(AuthClientService)
    private readonly authClientService: AuthClientService,
    @inject(CoreBindings.APPLICATION_CONFIG.deepProperty('initials'), {
      optional: true,
    })
    private initials?: ApplicationConfig,
  ) {
    this.logger = logger.extend('seeder');
  }

  async start() {
    if (process.env.SEED_DATA) {
      await this.seed();
    }
  }

  async stop() {
    // Nothing to do
  }

  async seed() {
    this.logger.info('Seeding data');
    // seed auth client
    const authClient = await this.authClientService.create({
      name: 'Example',
      description: 'Example client',
      clientId: 'example',
      clientSecret: 'example',
      clientType: ClientType.public,
      redirectUrl: 'http://localhost:5002',
      logoutRedirectUrl: 'http://localhost:5002',
    });
    this.logger.debug(authClient, 'Auth client created');
  }
}
