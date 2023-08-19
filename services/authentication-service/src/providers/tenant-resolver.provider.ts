import {Getter, Provider, inject} from '@loopback/core';
import {repository} from '@loopback/repository';

import {TenantResolverFn} from '@loopx/multi-tenancy';

import {Tenant} from '../models';
import {TenantRepository} from '../repositories';
import {AuthEntityBindings} from './keys';

export class TenantResolverProvider implements Provider<TenantResolverFn> {
  constructor(
    @repository(TenantRepository)
    private readonly tenantRepository: TenantRepository,
    @inject.getter(AuthEntityBindings.DEFAULT_TENANT)
    private readonly getDefaultTenant: Getter<Tenant>,
  ) {}

  value(): TenantResolverFn {
    return async id => this.action(id);
  }

  async action(id: string): Promise<Tenant | undefined> {
    // use default tenant if id is not provided
    return id ? this.tenantRepository.findById(id) : this.getDefaultTenant();
  }
}
