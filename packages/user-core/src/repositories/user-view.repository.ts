import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings} from '@bleco/authentication';
import {Getter} from '@loopback/context';
import {BindingScope, inject, injectable} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  repository,
} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';
import {mixinQuery} from 'loopback4-query';

import {UserDataSourceName} from '../keys';
import {Tenant, User, UserCredentials, UserRelations, UserTenant} from '../models';
import {AuditLogRepository} from './audit.repository';
import {TenantRepository} from './tenant.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserTenantRepository} from './user-tenant.repository';

const UserViewAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_View_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
@mixinQuery(true)
export class UserViewRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<User, typeof User.prototype.id, UserRelations>,
  UserViewAuditOpts,
) {
  public readonly tenant: BelongsToAccessor<Tenant, typeof User.prototype.id>;

  public readonly credentials: HasOneRepositoryFactory<UserCredentials, typeof User.prototype.id>;

  public readonly userTenants: HasManyRepositoryFactory<UserTenant, typeof User.prototype.id>;
  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
    this.userTenants = this.createHasManyRepositoryFactoryFor('userTenants', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenants', this.userTenants.inclusionResolver);
    this.credentials = this.createHasOneRepositoryFactoryFor('credentials', userCredentialsRepositoryGetter);
    this.registerInclusionResolver('credentials', this.credentials.inclusionResolver);
    this.tenant = this.createBelongsToAccessorFor('defaultTenant', tenantRepositoryGetter);
    this.registerInclusionResolver('defaultTenant', this.tenant.inclusionResolver);
  }
}
