import {AuthenticationBindings} from '@bleco/authentication';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository, EntityClass, IAuthTenantUser} from '@loopx/core';
import {UserTenant, UserTenantRepository} from '@loopx/user-core';

import {UserLevelResource, UserLevelResourceTypes} from '../models';
import {AuthDbSourceName} from '../types';

export class UserLevelResourceRepository<
  ULR extends UserLevelResourceTypes = UserLevelResourceTypes,
> extends DefaultUserUpdatableCrudRepository<ULR['Model'], ULR['ID']> {
  public readonly userTenant: BelongsToAccessor<UserTenant, typeof UserLevelResource.prototype.id>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
    entityClass: EntityClass<ULR['Model']> = UserLevelResource,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    this.userTenant = this.createBelongsToAccessorFor('userTenant', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenant', this.userTenant.inclusionResolver);
  }
}
