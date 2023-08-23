import {inject, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {LxCoreBindings} from '@loopx/core';

import {Tenant} from '../models';
import {TenantRepository} from '../repositories';

export class DefaultTenantProvider implements Provider<Tenant> {
  constructor(
    @repository(TenantRepository)
    private readonly tenantRepository: TenantRepository,
    @inject(LxCoreBindings.DEFAULT_TENANT_KEY)
    private readonly defaultTenantKey: string,
  ) {}

  async value(): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({where: {key: this.defaultTenantKey}});
    if (!tenant) {
      throw new Error(`Default tenant not found with key: ${this.defaultTenantKey}`);
    }
    return tenant;
  }
}
