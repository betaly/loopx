import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {UserLevelPermission, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserLevelPermissionAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Level_Permission_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class UserLevelPermissionRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserLevelPermission, typeof UserLevelPermission.prototype.id>,
  UserLevelPermissionAuditOpts,
) {
  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserLevelPermission.prototype.id>;

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
    super(UserLevelPermission, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
