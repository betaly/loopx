import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, EntityClass, IAuthUserWithPermissions} from '@loopx/core';

import {TenantConfig, TenantConfigTypes, TenantTypes} from '../models';
import {AuthDbSourceName} from '../types';
import {TenantRepository} from './tenant.repository';

export class TenantConfigRepository<
  C extends TenantConfigTypes = TenantConfigTypes,
  T extends TenantTypes = TenantTypes,
> extends DefaultUserUpdatableCrudRepository<C['Model'], C['ID'], C['Relations']> {
  public readonly tenant: BelongsToAccessor<T['Model'], C['ID']>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`) dataSource: juggler.DataSource,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository<T, C>>,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
    entityClass: EntityClass<C['Model']> = TenantConfig,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    this.tenant = this.createBelongsToAccessorFor('tenant', tenantRepositoryGetter);
    this.registerInclusionResolver('tenant', this.tenant.inclusionResolver);
  }
}
