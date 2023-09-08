import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {HasManyRepositoryFactory, HasOneRepositoryFactory, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';

import {UserDataSourceName} from '../keys';
import {Role, RoleRelations, User, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {UserTenantRepository} from './user-tenant.repository';
import {UserViewRepository} from './user-view.repository';

const RoleAuditOpts: IAuditMixinOptions = {
  actionKey: 'Role_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class RoleRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<Role, typeof Role.prototype.id, RoleRelations>,
  RoleAuditOpts,
) {
  public readonly userTenants: HasManyRepositoryFactory<UserTenant, typeof Role.prototype.id>;

  public readonly createdByUser: HasOneRepositoryFactory<User, typeof Role.prototype.id>;

  public readonly updatedByUser: HasOneRepositoryFactory<User, typeof Role.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @repository.getter('UserViewRepository')
    protected userViewRepositoryGetter: Getter<UserViewRepository>,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
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
