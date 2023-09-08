import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter} from '@loopback/context';
import {BindingScope, inject, injectable} from '@loopback/core';
import {juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';
import {mixinQuery} from 'loopback4-query';

import {UserDataSourceName} from '../keys';
import {User} from '../models';
import {AuditLogRepository} from './audit.repository';

const UserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_View_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
@mixinQuery(true)
export class UserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<User, typeof User.prototype.id>,
  UserViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
