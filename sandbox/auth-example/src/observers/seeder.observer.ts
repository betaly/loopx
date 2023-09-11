import {ApplicationConfig, CoreBindings, inject, LifeCycleObserver, lifeCycleObserver, service} from '@loopback/core';

import {ClientType} from '@bleco/authentication';

import {ILogger, LOGGER} from '@loopx/core';
import {AuthClientService} from '@loopx/user-core';

@lifeCycleObserver('seeder')
export class Seeder implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @service(AuthClientService)
    private readonly authClientService: AuthClientService,
    @inject(CoreBindings.APPLICATION_CONFIG.deepProperty('initials'), {
      optional: true,
    })
    private initials?: ApplicationConfig,
  ) {}

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
    this.logger.debug(`created auth client [name: ${authClient.name}, clientId: ${authClient.clientId}]`);

    // seed default tenant
    // await this.tenantRepo.findById(DEFAULT_TENANT_CODE);

    // seed admin role and default role
    // const adminRole = await this.roleRepo.findById(DefaultRole.SuperAdmin);
    // const regularRole = await this.roleRepo.findById(DefaultRole.User);
    // this.logger.debug(`created roles [${adminRole.name}(admin), ${regularRole.name}(default)]`);

    // // seed superadmin user
    // const superadminUsername =
    //   this.initials?.superadminUsername ?? process.env.SUPERADMIN_USERNAME ?? SUPERADMIN_USERNAME;
    // const superadminPassword = this.initials?.superadminPassword ?? process.env.SUPERADMIN_PASSWORD;

    // if (!superadminPassword) {
    //   throw new Error(`The password of superadmin(${superadminUsername}) is required`);
    // }
  }
}
