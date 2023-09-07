import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {Group, GroupRelations, UserGroup} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserGroupRepository} from './user-group.repository';

const GroupAuditOpts: IAuditMixinOptions = {
  actionKey: 'Group_Logs',
};

export class GroupRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<Group, typeof Group.prototype.id, GroupRelations>,
  GroupAuditOpts,
) {
  public readonly userGroups: HasManyRepositoryFactory<UserGroup, typeof Group.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('UserGroupRepository')
    protected userGroupRepositoryGetter: Getter<UserGroupRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(Group, dataSource, getCurrentUser);
    this.userGroups = this.createHasManyRepositoryFactoryFor('userGroups', userGroupRepositoryGetter);
    this.registerInclusionResolver('userGroups', this.userGroups.inclusionResolver);
  }
}
