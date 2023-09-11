﻿import {BindingScope, inject, injectable} from '@loopback/core';
import {Options, repository, WhereBuilder} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {IAuthTenantUser, UserStatus} from '@loopx/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {BErrors} from 'berrors';
import {Able, AclErrors, Actions} from 'loopback4-acl';
import defaultsDeep from 'tily/object/defaultsDeep';
import {uid} from 'uid/secure';

import {DEFAULT_SUPERADMIN_CREDENTIALS} from '../defaults';
import {AuthProvider, DefaultRole} from '../enums';
import {UserCoreBindings} from '../keys';
import {Role, User, UserDto, UserTenant, UserTenantWithRelations} from '../models';
import {
  AuthClientRepository,
  RoleRepository,
  UserCreationOptions,
  UserGroupRepository,
  UserRepository,
  UserTenantRepository,
} from '../repositories';
import {UserAuthSubjects} from '../subjects';
import {SuperadminCredentials} from '../types';
import {buildWhereClauseFromIdentifier, buildWhereClauseFromPossibleIdentifiers, subjectFor} from '../utils';

export interface UserSignupOptions extends UserCreationOptions {
  /**
   * Whether to activate the user after creation. Default: false
   */
  activate?: boolean;
}

@injectable({scope: BindingScope.SINGLETON})
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
    @inject(UserCoreBindings.DEFAULT_USERNAME_PREFIX)
    private readonly defaultUsernamePrefix: string,
  ) {}

  /**
   * Create a new user
   * @param userData
   * @param able - Able instance to check for permissions. If not provided, no permission checks will be performed.
   * @param options
   */
  async create(userData: UserDto, able: Able<IAuthTenantUser> | null, options?: UserSignupOptions): Promise<UserDto> {
    options = {
      authProvider: userData.authProvider,
      authId: userData.authId,
      ...options,
    };
    const user = userData.details;
    this.validateUserCreation(user, userData, able, options);

    const role: Role = await this.roleRepo.findById(userData.roleId);

    if (
      able?.cannot(
        Actions.create,
        subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId: userData.tenantId, role: role.name}),
      )
    ) {
      throw new AclErrors.NotAllowedAccess();
    }

    const status = options.activate ? UserStatus.ACTIVE : UserStatus.REGISTERED;

    const identifiersWhereClause = buildWhereClauseFromPossibleIdentifiers(user);
    const userExists = await this.userRepository.findOne({
      where: identifiersWhereClause,
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
        const userTenant: UserTenant = await this.createUserTenantData(userData, status, userExists?.id, options);
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
    const username = user.username ?? this.generateUsername();
    user.username = username.toLowerCase();
    //Override default tenant id
    user.defaultTenantId = userData.tenantId;
    const userSaved = await this.userRepository.create(user, options);
    const userTenantData = await this.createUserTenantData(userData, status, userSaved?.id, options);
    return new UserDto({
      details: userSaved,
      roleId: userTenantData.roleId,
      status: userTenantData.status,
      tenantId: userTenantData.tenantId,
      userTenantId: userTenantData.id,
      authProvider: options?.authProvider,
    });
  }

  generateUsername() {
    return `${this.defaultUsernamePrefix}${uid(12)}`;
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
      throw new BErrors.BadRequest('username or email or phone is required');
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
        subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {
          tenantId: able.user.tenantId,
          role: userTenant.role.name,
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
    if (able.cannot(Actions.delete, subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId}))) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForUpdatePermissions(able: Able<IAuthTenantUser>, id: string, tenantId?: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.UpdateOwnUser) >= 0 && currentUser.id !== id) {
    if (able.cannot(Actions.update, subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId, userId: id}))) {
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

  async initAdministrators(credentials?: SuperadminCredentials) {
    credentials = defaultsDeep(credentials, DEFAULT_SUPERADMIN_CREDENTIALS);
    await this.ensureSuperAdminUser(credentials);
  }

  async ensureSuperAdminUser(credentials: SuperadminCredentials) {
    const superAdminUser = await this.userRepository.findOne({
      where: buildWhereClauseFromIdentifier(credentials.identifier),
    });
    if (!superAdminUser) {
      await this.create(
        new UserDto({
          roleId: DefaultRole.SuperAdmin,
          tenantId: DEFAULT_TENANT_CODE,
          details: new User({
            username: credentials.identifier,
            firstName: 'Super',
            lastName: 'Admin',
          }),
        }),
        null,
        {activate: true, authProvider: AuthProvider.Internal},
      );
      await this.userRepository.setPassword(credentials.identifier, credentials.password);
    }
  }
}