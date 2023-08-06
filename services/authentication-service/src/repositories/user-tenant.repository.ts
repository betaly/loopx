import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';

import {DefaultSoftCrudRepository} from '@bleco/soft-delete';

import {EntityClass} from '@loopx/core';

import {Role, Tenant, User, UserLevelPermission, UserTenant, UserTenantTypes} from '../models';
import {AuthDbSourceName} from '../types';
import {RoleRepository} from './role.repository';
import {TenantRepository} from './tenant.repository';
import {UserLevelPermissionRepository} from './user-level-permission.repository';
import {UserRepository} from './user.repository';

export class UserTenantRepository<UT extends UserTenantTypes = UserTenantTypes> extends DefaultSoftCrudRepository<
  UT['Model'],
  UT['ID'],
  UT['Relations']
> {
  public readonly tenant: BelongsToAccessor<Tenant, UT['ID']>;

  public readonly user: BelongsToAccessor<User, UT['ID']>;

  public readonly role: BelongsToAccessor<Role, UT['ID']>;

  public readonly userLevelPermissions: HasManyRepositoryFactory<UserLevelPermission, typeof UserTenant.prototype.id>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('UserLevelPermissionRepository')
    protected userLevelPermissionRepositoryGetter: Getter<UserLevelPermissionRepository>,
    entityClass: EntityClass<UT['Model']> = UserTenant,
  ) {
    super(entityClass, dataSource);
    this.userLevelPermissions = this.createHasManyRepositoryFactoryFor(
      'userLevelPermissions',
      userLevelPermissionRepositoryGetter,
    );
    this.registerInclusionResolver('userLevelPermissions', this.userLevelPermissions.inclusionResolver);
    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.tenant = this.createBelongsToAccessorFor('tenant', tenantRepositoryGetter);
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
