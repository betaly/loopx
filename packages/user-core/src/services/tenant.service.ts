import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE, TenantStatus} from '@loopx/user-common';

import {TenantRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class TenantService {
  constructor(
    @repository(TenantRepository)
    readonly tenantRepository: TenantRepository,
  ) {}

  async initTenants() {
    await this.ensureDefaultTenant();
  }

  protected async ensureDefaultTenant() {
    const tenant = await this.tenantRepository.findOne({where: {code: DEFAULT_TENANT_CODE}});
    if (!tenant) {
      await this.tenantRepository.create({
        id: DEFAULT_TENANT_CODE,
        code: DEFAULT_TENANT_CODE,
        name: 'Default Tenant',
        status: TenantStatus.ACTIVE,
      });
    }
  }
}
