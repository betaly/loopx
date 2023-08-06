import {Provider, inject} from '@loopback/context';
import {repository} from '@loopback/repository';

import {Role} from '../models';
import {RoleRepository} from '../repositories';
import {AuthEntityBindings} from './keys';

export class DefaultRoleProvider implements Provider<Role> {
  constructor(
    @repository(RoleRepository)
    private readonly tenantRepository: RoleRepository,
    @inject(AuthEntityBindings.DefaultRoleName)
    private readonly defaultRoleName: string,
  ) {}

  async value(): Promise<Role> {
    const tenant = await this.tenantRepository.findOne({
      where: {
        or: [{id: this.defaultRoleName}, {name: this.defaultRoleName}],
      },
    });
    if (!tenant) {
      throw new Error(`Default tenant not found with key: ${this.defaultRoleName}`);
    }
    return tenant;
  }
}
