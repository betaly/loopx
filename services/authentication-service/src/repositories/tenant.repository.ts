import {Getter, inject} from '@loopback/core';
import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';

import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, EntityClass, IAuthUserWithPermissions} from '@loopx/core';

import {Tenant, TenantConfigTypes, TenantTypes} from '../models';
import {AuthDbSourceName} from '../types';
import {TenantConfigRepository} from './tenant-config.repository';

export class TenantRepository<
  T extends TenantTypes = TenantTypes,
  C extends TenantConfigTypes = TenantConfigTypes,
> extends DefaultUserUpdatableCrudRepository<T['Model'], T['ID'], T['Relations']> {
  public readonly tenantConfigs: HasManyRepositoryFactory<C['Model'], T['ID']>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('TenantConfigRepository')
    protected tenantConfigRepositoryGetter: Getter<TenantConfigRepository<C, T>>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
    entityClass: EntityClass<T['Model']> = Tenant,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    this.tenantConfigs = this.createHasManyRepositoryFactoryFor('tenantConfigs', tenantConfigRepositoryGetter);
    this.registerInclusionResolver('tenantConfigs', this.tenantConfigs.inclusionResolver);
  }
}
