import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, juggler, repository} from '@loopback/repository';

import {UserTenantDataSourceName} from '../keys';
import {AuthSecureClient} from '../models';
import {AuditLogRepository} from './audit.repository';

const AuthClientAuditOpts: IAuditMixinOptions = {
  actionKey: 'Auth_Client_Logs',
};

export class AuthSecureClientRepository extends ConditionalAuditRepositoryMixin(
  DefaultCrudRepository<AuthSecureClient, typeof AuthSecureClient.prototype.id>,
  AuthClientAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
  ) {
    super(AuthSecureClient, dataSource);
  }
}
