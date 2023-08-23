import {AuthenticationBindings} from '@bleco/authentication';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, EntityClass, IAuthUserWithPermissions} from '@loopx/core';

import {UserLevelPermission, UserLevelPermissionTypes, UserTenant} from '../models';
import {AuthDbSourceName} from '../types';
import {UserTenantRepository} from './user-tenant.repository';

export class UserLevelPermissionRepository<
  ULP extends UserLevelPermissionTypes = UserLevelPermissionTypes,
> extends DefaultUserUpdatableCrudRepository<ULP['Model'], ULP['ID']> {
  public readonly userTenant: BelongsToAccessor<UserTenant, ULP['ID']>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
    entityClass: EntityClass<ULP['Model']> = UserLevelPermission,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
