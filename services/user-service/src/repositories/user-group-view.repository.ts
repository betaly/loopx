import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {IAuthUserWithPermissions} from '@bleco/authorization';
import {Getter, inject} from '@loopback/context';
import {juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {AuditLogRepository} from './audit.repository';
import {UserGroupRepository} from './user-group.repository';
import {UserGroup} from '../models';

const UserGroupViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Group_View_Logs',
};

export class UserGroupViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserGroup, typeof UserGroup.prototype.id, UserGroup>,
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
    super(UserGroup, dataSource, getCurrentUser);
  }
}
