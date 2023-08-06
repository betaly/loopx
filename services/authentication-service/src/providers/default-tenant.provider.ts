import {Provider, inject} from '@loopback/context';
import {repository} from '@loopback/repository';

import {Tenant} from '../models';
import {TenantRepository} from '../repositories';
import {AuthEntityBindings} from './keys';

export class DefaultTenantProvider implements Provider<Tenant> {
  constructor(
    @repository(TenantRepository)
    private readonly tenantRepository: TenantRepository,
    @inject(AuthEntityBindings.DefaultTenantKey)
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
