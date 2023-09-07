import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {Group, UserGroup, UserGroupRelations, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {GroupRepository} from './group.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserGroupAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Group_Logs',
};

export class UserGroupRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserGroup, typeof UserGroup.prototype.id, UserGroupRelations>,
  UserGroupAuditOpts,
) {
  public readonly group: BelongsToAccessor<Group, typeof UserGroup.prototype.id>;

  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserGroup.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('GroupRepository')
    protected groupRepositoryGetter: Getter<GroupRepository>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserGroup, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter);
    this.registerInclusionResolver('group', this.group.inclusionResolver);
  }
}
