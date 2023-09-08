import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {UserDataSourceName} from '../keys';
import {User, UserCredentials, UserCredentialsRelations} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserRepository} from './user.repository';

const UserCredentialsAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Credentials_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class UserCredentialsRepository extends ConditionalAuditRepositoryMixin(
  DefaultSoftCrudRepository<UserCredentials, typeof UserCredentials.prototype.id, UserCredentialsRelations>,
  UserCredentialsAuditOpts,
) {
  public readonly user: BelongsToAccessor<User, typeof UserCredentials.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(UserCredentials, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
  }
}
