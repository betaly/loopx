import {bind, BindingScope} from '@loopback/core';
import {Options, repository, Where, WhereBuilder} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {IAuthTenantUser, UserStatus} from '@loopx/core';
import {Able, AclErrors, Actions} from 'loopback4-acl';

import {Role, User, UserDto, UserTenant, UserTenantWithRelations} from '../models';
import {
  AuthClientRepository,
  RoleRepository,
  UserCreationOptions,
  UserGroupRepository,
  UserRepository,
  UserTenantRepository,
} from '../repositories';
import {subjectFor} from '../utils';

@bind({scope: BindingScope.SINGLETON})
export class UserOperationsService {
  constructor(
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @repository(UserTenantRepository)
    private readonly utRepo: UserTenantRepository,
    @repository(RoleRepository)
    private readonly roleRepo: RoleRepository,
    @repository(AuthClientRepository)
    private readonly authClientsRepo: AuthClientRepository,
    @repository(UserGroupRepository)
    private readonly userGroupRepository: UserGroupRepository,
  ) {}

  /**
   * Create a new user
   * @param userData
   * @param able - Able instance to check for permissions. If not provided, no permission checks will be performed.
   * @param options
   */
  async create(userData: UserDto, able: Able<IAuthTenantUser> | null, options?: UserCreationOptions): Promise<UserDto> {
    options = {
      authProvider: userData.authProvider,
      authId: userData.authId,
      ...options,
    };
    const user = userData.details;
    this.validateUserCreation(user, userData, able, options);

    const role: Role = await this.roleRepo.findById(userData.roleId);
    const roleKey = role.roleKey;

    if (able?.cannot(Actions.create, subjectFor<UserTenant>('UserTenant', {tenantId: userData.tenantId, roleKey}))) {
      throw new AclErrors.NotAllowedAccess();
    }

    const or: Where<User>[] = [];
    if (user.username) {
      or.push({username: user.username});
    }
    if (user.email) {
      or.push({email: user.email});
    }
    if (user.phone) {
      or.push({phone: user.phone});
    }
    const userExists = await this.userRepository.findOne({
      where: {
        or,
      },
      fields: {
        id: true,
      },
    });
    if (userExists) {
      const userTenantExists = await this.utRepo.findOne({
        where: {
          userId: userExists.id,
          tenantId: userData.tenantId,
        },
      });
      if (userTenantExists) {
        throw new HttpErrors.BadRequest('User already exists');
      } else {
        const userTenant: UserTenant = await this.createUserTenantData(
          userData,
          UserStatus.REGISTERED,
          userExists?.id,
          options,
        );
        return new UserDto({
          details: userExists,
          roleId: userTenant.roleId,
          status: userTenant.status,
          tenantId: userTenant.tenantId,
          userTenantId: userTenant.id,
          authProvider: options?.authProvider,
        });
      }
    }

    // const authClients = await this.authClientsRepo.find({
    //   where: {
    //     clientId: {
    //       inq: role.allowedClients,
    //     },
    //   },
    // });
    // user.authClientIds = authClients.map(client => client.id!);
    const username = user.username;
    user.username = username.toLowerCase();
    //Override default tenant id
    user.defaultTenantId = userData.tenantId;
    const userSaved = await this.userRepository.create(user, options);
    const userTenantData = await this.createUserTenantData(userData, UserStatus.REGISTERED, userSaved?.id, options);
    return new UserDto({
      details: userSaved,
      roleId: userTenantData.roleId,
      status: userTenantData.status,
      tenantId: userTenantData.tenantId,
      userTenantId: userTenantData.id,
      authProvider: options?.authProvider,
    });
  }

  /**
   * Validate user creation.
   * @param user
   * @param userData
   * @param able - Able instance to check for permissions. If not provided, no permission checks will be performed.
   * @param options
   */
  validateUserCreation(user: User, userData: UserDto, able: Able<IAuthTenantUser> | null, options?: Options) {
    // if (able?.cannot(Actions.create, subjectForUT<UserTenant>('UserTenant', {tenantId: userData.tenantId}))) {
    //   throw new AclErrors.NotAllowedAccess();
    // }

    if (!user.username && !user.email && !user.phone) {
      throw new HttpErrors.BadRequest('Username or email or phone is required');
    }
    if (user.email) {
      user.email = user?.email?.toLowerCase().trim();

      // Check for valid email
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (user.email && !emailRegex.test(user.email)) {
        throw new HttpErrors.BadRequest('Email invalid.');
      }

      // Check for allowed domains
      const allowedDomains = (process.env.AUTO_SIGNUP_DOMAINS ?? '').split(',');
      const emailDomain = user.email.split('@')[1];
      if (!(emailDomain && allowedDomains.length > 0)) {
        throw new HttpErrors.BadRequest('Domain not supported, please enter a valid email');
      }
      if (allowedDomains && allowedDomains.length === 1 && allowedDomains[0] === '*' && options) {
        options.authProvider = 'keycloak';
      } else if (!allowedDomains.includes(emailDomain) && options) {
        options.authProvider = options.authProvider || 'internal';
      } else {
        // Do nothing
      }
    }
  }

  async createUserTenantData(userData: UserDto, userStatus: UserStatus, userId?: string, options?: Options) {
    return this.utRepo.create(
      {
        roleId: userData.roleId,
        status: userStatus,
        tenantId: userData.tenantId,
        userId,
      },
      options,
    );
  }

  async updateById(
    able: Able<IAuthTenantUser> | null,
    id: string,
    userData: Omit<User, 'id' | 'authClientIds' | 'lastLogin' | 'status' | 'tenantId'>,
    tenantId: string,
    options?: Options,
  ): Promise<void> {
    if (able) {
      await this.checkForUpdatePermissions(able, id, tenantId);
    }

    if (userData.username) {
      const whereBuilder = new WhereBuilder();
      whereBuilder.neq('id', id);
      whereBuilder.eq('username', userData.username);
      const userNameExists = await this.userRepository.count(whereBuilder.build(), options);
      if (userNameExists && userNameExists.count > 0) {
        throw new HttpErrors.Forbidden('Username already exists');
      }
    }

    const tempUser = new User({
      ...userData,
    });

    if (tempUser) {
      await this.userRepository.updateById(id, tempUser, options);
    }

    await this.updateUserTenant(userData, id, able?.user, options);
  }

  async updateUserTenant(userData: Partial<UserDto>, id: string, currentUser?: IAuthTenantUser, options?: Options) {
    const utData: Partial<UserTenant> = {};
    if (userData.roleId) {
      utData.roleId = userData.roleId;
    }
    if (userData.status) {
      utData.status = userData.status;
    }
    const tenantId = userData.tenantId ?? currentUser?.tenantId;
    if (!tenantId) {
      throw new HttpErrors.BadRequest('Tenant id is required');
    }
    if (utData && Object.keys(utData).length > 0) {
      await this.utRepo.updateAll(
        utData,
        {
          userId: id,
          tenantId,
        },
        options,
      );
    }
  }

  async deleteById(able: Able<IAuthTenantUser> | null, id: string, tenantId: string, options?: Options): Promise<void> {
    if (able) {
      await this.checkForDeleteTenantUserRestrictedPermission(able, id);
      await this.checkForDeleteTenantUserPermission(able, id);
      await this.checkForDeleteAnyUserPermission(able, tenantId);
    }

    const existingUserTenant = await this.utRepo.findOne(
      {
        where: {
          userId: id,
          // tenantId: currentUser.tenantId,
          tenantId,
        },
      },
      options,
    );
    await this.userGroupRepository.deleteAll(
      {
        userTenantId: existingUserTenant?.id,
      },
      options,
    );
    await this.utRepo.deleteAll(
      {
        userId: id,
        // tenantId: currentUser.tenantId,
        tenantId,
      },
      options,
    );
    const ut = await this.utRepo.findOne(
      {
        where: {
          userId: id,
        },
      },
      options,
    );
    let defaultTenantId = null;
    if (ut) {
      defaultTenantId = ut.tenantId;
    }
    await this.userRepository.updateById(
      id,
      {
        // eslint-disable-next-line
        //@ts-ignore
        defaultTenantId: defaultTenantId,
      },
      options,
    );
  }

  async checkForDeleteTenantUserRestrictedPermission(able: Able<IAuthTenantUser>, id: string) {
    const userTenant = (await this.utRepo.findOne({
      where: {
        userId: id,
        tenantId: able.user.tenantId,
      },
      include: [
        {
          relation: 'role',
        },
      ],
    })) as UserTenantWithRelations;
    if (
      able.cannot(
        Actions.delete,
        subjectFor<UserTenant>('UserTenant', {
          tenantId: able.user.tenantId,
          roleKey: userTenant.role.roleKey,
        }),
      )
    ) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForDeleteTenantUserPermission(able: Able<IAuthTenantUser>, id: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.DeleteTenantUser) >= 0) {
    if (able.cannot(Actions.delete, 'UserTenant')) {
      throw new AclErrors.NotAllowedAccess();
    }
    const userTenant = await this.utRepo.findOne({
      where: {
        userId: id,
        tenantId: able.user.tenantId,
      },
    });
    if (!userTenant) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForDeleteAnyUserPermission(able: Able<IAuthTenantUser>, tenantId: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.DeleteAnyUser) < 0 && tenantId !== currentUser.tenantId) {
    if (able.cannot(Actions.delete, subjectFor<UserTenant>('UserTenant', {tenantId}))) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForUpdatePermissions(able: Able<IAuthTenantUser>, id: string, tenantId?: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.UpdateOwnUser) >= 0 && currentUser.id !== id) {
    if (able.cannot(Actions.update, subjectFor<UserTenant>('UserTenant', {tenantId, userId: id}))) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async getUserTenant(userId: string, currentUser: IAuthTenantUser) {
    return this.utRepo.findOne({
      where: {
        userId: userId,
        tenantId: currentUser.tenantId,
      },
      include: [{relation: 'role'}],
    });
  }
}
