import {DEFAULT_TENANT_CODE} from '@loopx/user-common';

import {DefaultRole} from '../../enums';
import {User, UserDto} from '../../models';
import {UserTenantRepository} from '../../repositories';
import {RoleService, TenantService, UserOperationsService} from '../../services';
import {UserTenantApplication} from './application';

export type SeedResult = Awaited<ReturnType<typeof seed>>;

export async function seed(app: UserTenantApplication) {
  const tenantService = await app.getService(TenantService);
  const tenantRepository = tenantService.tenantRepository;
  const utRepository = await app.getRepository(UserTenantRepository);
  const roleService = await app.getService(RoleService);
  const roleRepository = roleService.roleRepository;
  const userOpsService = await app.getService(UserOperationsService);

  // ensure default tenant and protected roles for `beforeEach`
  await tenantService.initTenants();
  await roleService.initRoles();
  await userOpsService.initAdministrators();

  const tenant = await tenantRepository.findById(DEFAULT_TENANT_CODE);
  const roles = {
    owner: await roleRepository.findById(DefaultRole.Owner),
    admin: await roleRepository.findById(DefaultRole.Admin),
    user: await roleRepository.findById(DefaultRole.User),
  };

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
    user: await userOpsService.create(
      new UserDto({
        tenantId: tenant.id,
        roleId: roles.user.id,
        details: new User({username: 'user'}),
      }),
      null,
    ),
  };

  const userTenants = {
    owner: await utRepository.findById(users.owner.userTenantId),
    admin: await utRepository.findById(users.admin.userTenantId),
    user: await utRepository.findById(users.user.userTenantId),
  };

  return {
    roles,
    tenant,
    users,
    userTenants,
  };
}
