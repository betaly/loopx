import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {IAuthUserWithPermissions} from '@bleco/authorization';
import {Getter, inject} from '@loopback/context';
import {juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {UserGroupView} from '../models/group-user-view.model';
import {AuditLogRepository} from './audit.repository';
import {UserGroupRepository} from './user-group.repository';

const UserGroupViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Group_View_Logs',
};

export class UserGroupViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserGroupView, typeof UserGroupView.prototype.id, UserGroupView>,
  UserGroupViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserGroupRepository')
    protected userGroupRepositoryGetter: Getter<UserGroupRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserGroupView, dataSource, getCurrentUser);
  }
}
