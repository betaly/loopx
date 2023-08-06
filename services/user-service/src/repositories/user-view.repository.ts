import {Getter} from '@loopback/context';
import {inject} from '@loopback/core';
import {juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {UserView} from '../models';
import {AuditLogRepository} from './audit.repository';

const UserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_View_Logs',
};

export class UserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<UserView, typeof UserView.prototype.id>,
  UserViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(UserView, dataSource, getCurrentUser);
  }
}
