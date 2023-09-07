import {TenantStatus} from '@loopx/core';

import {ensureBuiltinRoles} from '../../ensures';
import {RoleKey} from '../../enums';
import {User, UserDto} from '../../models';
import {RoleRepository, TenantRepository, UserTenantRepository} from '../../repositories';
import {UserOperationsService} from '../../services';
import {UserTenantApplication} from './application';

export type SeedResult = Awaited<ReturnType<typeof seed>>;

export async function seed(app: UserTenantApplication) {
  const tenantRepository = await app.getRepository(TenantRepository);
  const roleRepository = await app.getRepository(RoleRepository);
  // const userRepository = await app.getRepository(UserRepository);
  const utRepository = await app.getRepository(UserTenantRepository);
  const userOpsService = await app.getService(UserOperationsService);

  await ensureBuiltinRoles(roleRepository);
  const roles = {
    owner: (await roleRepository.findOne({where: {roleKey: RoleKey.Owner}}))!,
    admin: (await roleRepository.findOne({where: {roleKey: RoleKey.Admin}}))!,
    member: (await roleRepository.findOne({where: {roleKey: RoleKey.Member}}))!,
  };
  const tenant = await tenantRepository.create({
    id: 'default',
    name: 'Default',
    status: TenantStatus.ACTIVE,
  });

  const users = {
    owner: await userOpsService.create(
      new UserDto({
        tenantId: tenant.id,
        roleId: roles.owner.id,
        details: new User({username: 'owner'}),
      }),
      null,
    ),
    admin: await userOpsService.create(
      new UserDto({
        tenantId: tenant.id,
        roleId: roles.admin.id,
        details: new User({username: 'admin'}),
      }),
      null,
    ),
    member: await userOpsService.create(
      new UserDto({
        tenantId: tenant.id,
        roleId: roles.member.id,
        details: new User({username: 'member'}),
      }),
      null,
    ),
  };

  const userTenants = {
    owner: await utRepository.findById(users.owner.userTenantId),
    admin: await utRepository.findById(users.admin.userTenantId),
    member: await utRepository.findById(users.member.userTenantId),
  };

  return {
    roles,
    tenant,
    users,
    userTenants,
  };
}
