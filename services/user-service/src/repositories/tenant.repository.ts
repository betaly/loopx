import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {Tenant, TenantConfig, TenantRelations, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {TenantConfigRepository} from './tenant-config.repository';
import {UserTenantRepository} from './user-tenant.repository';

const TenantAuditOpts: IAuditMixinOptions = {
  actionKey: 'Tenant_Logs',
};

export class TenantRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<Tenant, typeof Tenant.prototype.id, TenantRelations>,
  TenantAuditOpts,
) {
  public readonly tenantConfigs: HasManyRepositoryFactory<TenantConfig, typeof Tenant.prototype.id>;

  public readonly userTenants: HasManyRepositoryFactory<UserTenant, typeof Tenant.prototype.id>;

  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('TenantConfigRepository')
    protected tenantConfigRepositoryGetter: Getter<TenantConfigRepository>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(Tenant, dataSource, getCurrentUser);
    this.userTenants = this.createHasManyRepositoryFactoryFor('userTenants', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenants', this.userTenants.inclusionResolver);

    this.tenantConfigs = this.createHasManyRepositoryFactoryFor('tenantConfigs', tenantConfigRepositoryGetter);
    this.registerInclusionResolver('tenantConfigs', this.tenantConfigs.inclusionResolver);
  }
}
