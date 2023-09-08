import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {UserTenant, UserTenantPrefs} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserTenantPrefsAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Tenant_Prefs_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class UserTenantPrefsRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserTenantPrefs, typeof UserTenantPrefs.prototype.id, UserTenantPrefs>,
  UserTenantPrefsAuditOpts,
) {
  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserTenantPrefs.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(UserTenantPrefs, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
