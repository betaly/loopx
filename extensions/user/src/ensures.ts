import {RoleKeyMap} from './enums';
import {RoleRepository} from './repositories';

export async function ensureBuiltinRoles(roleRepo: RoleRepository) {
  for (const key of Object.keys(RoleKeyMap)) {
    const value = RoleKeyMap[key];
    const roleId = key;
    const role = await roleRepo.findOne({where: {id: roleId}});
    if (!role) {
      await roleRepo.create({
        id: roleId,
        name: value.name,
        roleKey: value.key,
      });
    } else if (role.roleKey !== value.key) {
      await roleRepo.updateById(roleId, {
        roleKey: value.key,
      });
    }
  }
}
