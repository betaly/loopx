import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {UserLevelPermission, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserLevelPermissionAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Level_Permission_Logs',
};

export class UserLevelPermissionRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserLevelPermission, typeof UserLevelPermission.prototype.id>,
  UserLevelPermissionAuditOpts,
) {
  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserLevelPermission.prototype.id>;

  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(UserLevelPermission, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
