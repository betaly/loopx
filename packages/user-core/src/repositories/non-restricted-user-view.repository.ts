import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {Getter} from '@loopback/context';
import {BindingScope, inject, injectable} from '@loopback/core';
import {DefaultCrudRepository, juggler, repository} from '@loopback/repository';
import {mixinQuery} from 'loopback4-query';

import {UserDataSourceName} from '../keys';
import {User} from '../models';
import {AuditLogRepository} from './audit.repository';

const NonRestrictedUserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'Non_Restricted_User_View_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
@mixinQuery(true)
export class NonRestrictedUserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultCrudRepository<User, typeof User.prototype.id>,
  NonRestrictedUserViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(User, dataSource);
  }
}
