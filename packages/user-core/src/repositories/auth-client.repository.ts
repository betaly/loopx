import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {juggler, repository} from '@loopback/repository';

import {UserDataSourceName} from '../keys';
import {AuthClient} from '../models';
import {AuditLogRepository} from './audit.repository';

const AuthClientAuditOpts: IAuditMixinOptions = {
  actionKey: 'Auth_Client_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class AuthClientRepository extends ConditionalAuditRepositoryMixin(
  DefaultSoftCrudRepository<AuthClient, typeof AuthClient.prototype.id>,
  AuthClientAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(AuthClient, dataSource);
  }
}
