import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, HasOneRepositoryFactory, juggler, repository} from '@loopback/repository';

import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, IAuthUserWithPermissions} from '@loopx/core';

import {UserTenantDataSourceName} from '../keys';
import {Role, RoleRelations, UserTenant, UserView} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';
import {UserViewRepository} from './user-view.repository';

const RoleAuditOpts: IAuditMixinOptions = {
  actionKey: 'Role_Logs',
};

export class RoleRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<Role, typeof Role.prototype.id, RoleRelations>,
  RoleAuditOpts,
) {
  public readonly userTenants: HasManyRepositoryFactory<UserTenant, typeof Role.prototype.id>;

  public readonly createdByUser: HasOneRepositoryFactory<UserView, typeof Role.prototype.id>;

  public readonly updatedByUser: HasOneRepositoryFactory<UserView, typeof Role.prototype.id>;

  constructor(
    @inject(`datasources.${UserTenantDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('UserViewRepository')
    protected userViewRepositoryGetter: Getter<UserViewRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(Role, dataSource, getCurrentUser);
    this.updatedByUser = this.createHasOneRepositoryFactoryFor('updatedByUser', userViewRepositoryGetter);
    this.registerInclusionResolver('updatedByUser', this.updatedByUser.inclusionResolver);
    this.createdByUser = this.createHasOneRepositoryFactoryFor('createdByUser', userViewRepositoryGetter);
    this.registerInclusionResolver('createdByUser', this.createdByUser.inclusionResolver);
    this.userTenants = this.createHasManyRepositoryFactoryFor('userTenants', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenants', this.userTenants.inclusionResolver);
  }
}
