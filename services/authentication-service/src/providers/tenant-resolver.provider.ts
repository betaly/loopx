import {Getter, inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {TenantResolverFn} from '@loopx/multi-tenancy';
import {Tenant, TenantRepository} from '@loopx/user-core';

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
    if (id) {
      const tenant = await this.tenantRepository.findOne({where: {id}});
      if (tenant) {
        return tenant;
      }
    }
  }
}
