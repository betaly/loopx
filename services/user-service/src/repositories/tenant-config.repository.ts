import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {Tenant, TenantConfig, TenantConfigRelations} from '../models';
import {AuditLogRepository} from './audit.repository';
import {TenantRepository} from './tenant.repository';

const TenantConfigAuditOpts: IAuditMixinOptions = {
  actionKey: 'Tenant_Config_Logs',
};

export class TenantConfigRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<TenantConfig, typeof TenantConfig.prototype.id, TenantConfigRelations>,
  TenantConfigAuditOpts,
) {
  public readonly tenant: BelongsToAccessor<Tenant, typeof TenantConfig.prototype.id>;

  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(TenantConfig, dataSource, getCurrentUser);
    this.tenant = this.createBelongsToAccessorFor('tenant', tenantRepositoryGetter);
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
