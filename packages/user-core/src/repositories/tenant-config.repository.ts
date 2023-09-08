import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {Tenant, TenantConfig, TenantConfigRelations} from '../models';
import {AuditLogRepository} from './audit.repository';
import {TenantRepository} from './tenant.repository';

const TenantConfigAuditOpts: IAuditMixinOptions = {
  actionKey: 'Tenant_Config_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class TenantConfigRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<TenantConfig, typeof TenantConfig.prototype.id, TenantConfigRelations>,
  TenantConfigAuditOpts,
) {
  public readonly tenant: BelongsToAccessor<Tenant, typeof TenantConfig.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(TenantConfig, dataSource, getCurrentUser);
    this.tenant = this.createBelongsToAccessorFor('tenant', tenantRepositoryGetter);
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
