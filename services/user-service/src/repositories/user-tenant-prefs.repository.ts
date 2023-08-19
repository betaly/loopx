import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {UserTenant, UserTenantPrefs} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserTenantPrefsAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Tenant_Prefs_Logs',
};

export class UserTenantPrefsRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserTenantPrefs, typeof UserTenantPrefs.prototype.id, UserTenantPrefs>,
  UserTenantPrefsAuditOpts,
) {
  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserTenantPrefs.prototype.id>;

  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserTenantPrefs, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
