import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter} from '@loopback/context';
import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler, repository} from '@loopback/repository';
import {IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {UserView} from '../models';
import {AuditLogRepository} from './audit.repository';

const NonRestrictedUserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'Non_Restricted_User_View_Logs',
};

export class NonRestrictedUserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultCrudRepository<UserView, typeof UserView.prototype.id>,
  NonRestrictedUserViewAuditOpts,
) {
  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserView, dataSource);
  }
}
