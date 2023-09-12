import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';

import {DefaultRoleMap, RoleMapData} from '../enums';
import {RoleRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class RoleService {
  constructor(
    @repository(RoleRepository)
    readonly roleRepository: RoleRepository,
  ) {}

  async initRoles() {
    await this.ensureProtectedRoles();
  }

  protected async ensureProtectedRoles() {
    for (const key of Object.keys(DefaultRoleMap)) {
      await this.ensureProtectedRole(key, DefaultRoleMap[key]);
    }
  }

  protected async ensureProtectedRole(id: string, roleData: RoleMapData) {
    const role = await this.roleRepository.findOne({where: {id: id}});
    if (role) {
      await this.roleRepository.updateById(id, {
        code: roleData.code ?? role.code,
        name: roleData.name ?? role.name,
      });
    } else {
      await this.roleRepository.create({
        id: id,
        code: roleData.code,
        name: roleData.name,
        protected: true,
      });
    }
  }
}
