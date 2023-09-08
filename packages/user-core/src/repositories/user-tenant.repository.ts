import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';

import {UserDataSourceName} from '../keys';
import {Role, Tenant, User, UserGroup, UserLevelPermission, UserTenant, UserTenantRelations} from '../models';
import {AuditLogRepository} from './audit.repository';
import {RoleRepository} from './role.repository';
import {TenantRepository} from './tenant.repository';
import {UserRepository} from './user.repository';
import {UserGroupRepository} from './user-group.repository';
import {UserLevelPermissionRepository} from './user-level-permission.repository';

const UserTenantAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Tenant_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class UserTenantRepository extends ConditionalAuditRepositoryMixin(
  DefaultSoftCrudRepository<UserTenant, typeof UserTenant.prototype.id, UserTenantRelations>,
  UserTenantAuditOpts,
) {
  public readonly tenant: BelongsToAccessor<Tenant, typeof UserTenant.prototype.id>;

  public readonly role: BelongsToAccessor<Role, typeof UserTenant.prototype.id>;

  public readonly userLevelPermissions: HasManyRepositoryFactory<UserLevelPermission, typeof UserTenant.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof UserTenant.prototype.id>;

  public readonly userGroups: HasManyRepositoryFactory<UserGroup, typeof UserTenant.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('UserLevelPermissionRepository')
    protected userLevelPermissionRepositoryGetter: Getter<UserLevelPermissionRepository>,
    @repository.getter('UserGroupRepository')
    protected userGroupRepositoryGetter: Getter<UserGroupRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(UserTenant, dataSource);
    this.userGroups = this.createHasManyRepositoryFactoryFor('userGroups', userGroupRepositoryGetter);
    this.registerInclusionResolver('userGroups', this.userGroups.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);

    this.userLevelPermissions = this.createHasManyRepositoryFactoryFor(
      'userLevelPermissions',
      userLevelPermissionRepositoryGetter,
    );
    this.registerInclusionResolver('userLevelPermissions', this.userLevelPermissions.inclusionResolver);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);

    this.tenant = this.createBelongsToAccessorFor('tenant', tenantRepositoryGetter);
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
