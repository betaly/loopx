import {Getter, inject} from '@loopback/context';
import {juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {GroupUserCountView} from '../models/group-user-count-view.model';
import {AuditLogRepository} from './audit.repository';
import {UserGroupRepository} from './user-group.repository';

const UserGroupCountAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Group_Count_Audit_Logs',
};

export class UserGroupCountViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<GroupUserCountView, typeof GroupUserCountView.prototype.id, GroupUserCountView>,
  UserGroupCountAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('UserGroupRepository')
    protected userGroupRepositoryGetter: Getter<UserGroupRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(GroupUserCountView, dataSource, getCurrentUser);
  }
}
