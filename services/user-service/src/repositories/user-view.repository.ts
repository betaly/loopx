import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter} from '@loopback/context';
import {inject} from '@loopback/core';
import {juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {User} from '../models';
import {AuditLogRepository} from './audit.repository';

const UserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_View_Logs',
};

export class UserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<User, typeof User.prototype.id>,
  UserViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
