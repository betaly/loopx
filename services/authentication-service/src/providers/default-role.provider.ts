import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {RoleTypes} from '@loopx/core';

import {Role} from '../models';
import {RoleRepository} from '../repositories';

export class DefaultRoleProvider implements Provider<Role> {
  constructor(
    @repository(RoleRepository)
    private readonly roleRepo: RoleRepository,
  ) {}

  async value(): Promise<Role> {
    const tenant = await this.roleRepo.findOne({
      where: {roleType: RoleTypes.Default},
    });
    if (!tenant) {
      throw new Error(`No default type role found. You must seed the database first.`);
    }
    return tenant;
  }
}
