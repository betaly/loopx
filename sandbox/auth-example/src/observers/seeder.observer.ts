import {
  Application,
  ApplicationConfig,
  CoreBindings,
  LifeCycleObserver,
  inject,
  lifeCycleObserver,
  service,
} from '@loopback/core';
import {repository} from '@loopback/repository';

import {ClientType} from '@bleco/authentication';

import {ILogger, LOGGER, extractPermissions} from '@loopx/core';
import {
  AuthClientService,
  RoleKey,
  RoleRepository,
  TenantRepository,
  TenantStatus,
  PermissionKey as UserPermissionKey,
} from '@loopx/user-service';

import {UserDto} from '../models/user.dto';
import {UserOpsService} from '../services';

const AllPermissionKeys = [UserPermissionKey];
const DefaultRolePermissionsPatterns = ['*Own*'];

const SUPERADMIN_USERNAME = 'superadmin';

@lifeCycleObserver('seeder')
export class Seeder implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @service(AuthClientService)
    private readonly authClientService: AuthClientService,
    @repository(TenantRepository)
    private readonly tenantRepo: TenantRepository,
    @repository(RoleRepository)
    private readonly roleRepo: RoleRepository,
    @service(UserOpsService)
    private readonly userOpsService: UserOpsService,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly app: Application,
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
    });
    this.logger.debug(`created auth client [name: ${authClient.name}, clientId: ${authClient.clientId}]`);

    // seed default tenant
    const defaultTenant = await this.tenantRepo.create({
      name: 'Default',
      key: 'default',
      status: TenantStatus.ACTIVE,
    });
    this.logger.debug(`created tenant [name: ${defaultTenant.name}, key: ${defaultTenant.key}]`);

    // seed admin role and default role
    const [adminRole, regularRole] = await this.roleRepo.createAll([
      {
        name: 'Platform Admin',
        roleType: RoleKey.Admin,
        permissions: ['*'],
      },
      {
        name: 'Regular User',
        roleType: RoleKey.Default,
        permissions: extractPermissions(AllPermissionKeys, DefaultRolePermissionsPatterns),
      },
    ]);
    this.logger.debug(`created roles [${adminRole.name}(admin), ${regularRole.name}(default)]`);

    // seed superadmin user
    const superadminUsername =
      this.initials?.superadminUsername ?? process.env.SUPERADMIN_USERNAME ?? SUPERADMIN_USERNAME;
    const superadminPassword = this.initials?.superadminPassword ?? process.env.SUPERADMIN_PASSWORD;

    if (!superadminPassword) {
      throw new Error(`The password of superadmin(${superadminUsername}) is required`);
    }

    await this.userOpsService.createUser(
      new UserDto({
        username: superadminUsername,
        email: 'admin@taok.io',
        roleId: adminRole.id,
        tenantId: defaultTenant.id,
        password: superadminPassword,
      }),
    );
    this.logger.debug(`created user [username: ${superadminUsername}, role: ${adminRole.name}(${adminRole.roleType})]`);
  }
}
