import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {Tenant, TenantRepository} from '@loopx/user-core';

export class DefaultTenantProvider implements Provider<Tenant> {
  constructor(
    @repository(TenantRepository)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async value(): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({where: {code: DEFAULT_TENANT_CODE}});
    if (!tenant) {
      throw new Error(`Default tenant not found with default tenant code: ${DEFAULT_TENANT_CODE}`);
    }
    return tenant;
  }
}
