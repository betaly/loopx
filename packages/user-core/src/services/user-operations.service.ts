import {BindingScope, inject, injectable} from '@loopback/core';
import {DataObject, FilterBuilder, Options, repository, Where, WhereBuilder} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {IAuthTenantUser, UserStatus} from '@loopx/core';
import {BErrors} from 'berrors';
import {Able, AclErrors, Actions} from 'loopback4-acl';
import {uid} from 'uid/secure';

import {UserCoreBindings} from '../keys';
import {Role, TenantUserData, TenantUserView, User, UserTenant} from '../models';
import {UserView} from '../models/user.view';
import {
  AuthClientRepository,
  RoleRepository,
  UserCreationOptions,
  UserGroupRepository,
  UserRepository,
  UserTenantRepository,
  UserViewRepository,
} from '../repositories';
import {UserAuthSubjects} from '../subjects';
import {buildWhereClauseFromPossibleIdentifiers, subjectFor} from '../utils';

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
    private readonly userRepo: UserRepository,
    @repository(UserViewRepository)
    private readonly userViewRepo: UserViewRepository,
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
   * @param data - User data
   * @param able - Able instance to check for permissions. If not provided, no permission checks will be performed.
   * @param options - Options
   */
  async create(
    data: TenantUserData,
    able: Able<IAuthTenantUser> | null,
    options?: UserSignupOptions,
  ): Promise<TenantUserView> {
    options = {
      authProvider: data.authProvider,
      authId: data.authId,
      ...options,
    };
    const user = data.userDetails;
    const role: Role = await this.roleRepo.findById(data.roleId);

    this.validateUserCreation(data, role, able, options);

    const status = options?.activate ? UserStatus.ACTIVE : UserStatus.REGISTERED;

    const identifiersWhereClause = buildWhereClauseFromPossibleIdentifiers(user);
    const userExists = await this.userRepo.findOne({
      where: identifiersWhereClause,
      fields: {
        id: true,
      },
    });
    if (userExists) {
      const userTenantExists = await this.utRepo.findOne({
        where: {
          userId: userExists.id,
          tenantId: data.tenantId,
        },
      });
      if (userTenantExists) {
        throw new HttpErrors.BadRequest('User already exists');
      } else {
        const userTenant: UserTenant = await this.createUserTenantData(data, status, userExists?.id, options);
        return TenantUserView.fromUserTenantAndUser(userTenant, userExists, {authProvider: options?.authProvider});
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
    user.defaultTenantId = data.tenantId;
    const userSaved = await this.userRepo.create(user, options);

    const userTenantData = await this.createUserTenantData(data, status, userSaved?.id, options);
    return TenantUserView.fromUserTenantAndUser(userTenantData, userSaved, {authProvider: options?.authProvider});
  }

  generateUsername() {
    return `${this.defaultUsernamePrefix}${uid(12)}`;
  }

  /**
   * Validate user creation.
   * @param data
   * @param role
   * @param able - Able instance to check for permissions. If not provided, no permission checks will be performed.
   * @param options
   */
  validateUserCreation(data: TenantUserData, role: Role, able: Able<IAuthTenantUser> | null, options?: Options) {
    if (
      able?.cannot(
        Actions.create,
        subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId: data.tenantId, role: role.code}),
      )
    ) {
      throw new AclErrors.NotAllowedAccess();
    }

    const user = data.userDetails;

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

  async createUserTenantData(data: DataObject<TenantUserData>, status: UserStatus, userId?: string, options?: Options) {
    return this.utRepo.create(
      {
        roleId: data.roleId,
        tenantId: data.tenantId,
        status,
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
      await this.validateIdentifierExists(id, userData.username, 'username', options);
    }
    if (userData.email) {
      await this.validateIdentifierExists(id, userData.email, 'email', options);
    }
    if (userData.phone) {
      await this.validateIdentifierExists(id, userData.phone, 'phone', options);
    }

    const tempUser = new User({
      ...userData,
    });

    if (tempUser) {
      await this.userRepo.updateById(id, tempUser, options);
    }

    await this.updateUserTenant(userData, id, able?.user, options);
  }

  async updateUserTenant(
    userData: Partial<TenantUserView>,
    id: string,
    currentUser?: IAuthTenantUser,
    options?: Options,
  ) {
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

  async deleteById(
    able: Able<IAuthTenantUser> | null,
    userId: string,
    tenantId: string,
    options?: Options,
  ): Promise<void> {
    if (able) {
      await this.checkForDeleteTenantUserPermission(able, tenantId);
    }

    const existingUserTenant = await this.utRepo.findOne(
      {
        where: {
          userId,
          tenantId,
        },
      },
      options,
    );

    if (!existingUserTenant) {
      return;
    }

    if (able) {
      await this.checkForDeleteTenantUserRestrictedPermission(able, existingUserTenant);
    }

    await this.userGroupRepository.deleteAll(
      {
        userTenantId: existingUserTenant.id,
      },
      options,
    );
    await this.utRepo.deleteAll(
      {
        userId: userId,
        tenantId,
      },
      options,
    );

    const {defaultTenantId} = await this.userRepo.findById(userId, {fields: ['defaultTenantId']}, options);

    if (defaultTenantId === tenantId) {
      // change default tenant id if the deleted tenant is the default tenant
      const ut = await this.utRepo.findOne(
        {
          where: {
            userId: userId,
          },
        },
        options,
      );
      await this.userRepo.updateById(
        userId,
        {
          // eslint-disable-next-line
          //@ts-ignore
          defaultTenantId: ut ? ut.tenantId : null,
        },
        options,
      );
    }
  }

  async getUserTenant(able: Able<IAuthTenantUser> | null, where: Where<UserTenant>, options?: Options) {
    const ut = await this.utRepo.findOne({where}, options);
    if (!ut) {
      throw new BErrors.NotFound('User tenant not found');
    }
    if (able?.cannot(Actions.read, subjectFor<UserTenant>(UserAuthSubjects.UserTenant, ut))) {
      throw new AclErrors.NotAllowedAccess();
    }

    return ut;
  }

  async findOneUserView(where: Where<User>, options?: Options): Promise<UserView | undefined> {
    const filterBuilder = new FilterBuilder<User>();
    filterBuilder.where(where);
    filterBuilder.include(...UserView.InclusionsForUser);
    const user = await this.userViewRepo.findOne(filterBuilder.build(), options);
    if (user) {
      return UserView.fromUser(user, true);
    }
  }

  async findUserViews(where: Where<User>, options?: Options): Promise<UserView[] | undefined> {
    const filterBuilder = new FilterBuilder<User>();
    filterBuilder.where(where);
    filterBuilder.include(...UserView.InclusionsForUser);
    const user = await this.userViewRepo.findOne(filterBuilder.build(), options);
    if (user) {
      return UserView.fromUser(user);
    }
  }

  async checkForDeleteTenantUserRestrictedPermission(able: Able<IAuthTenantUser>, ut: UserTenant) {
    if (
      able.cannot(
        Actions.delete,
        subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {
          tenantId: ut.tenantId,
          roleId: ut.roleId,
        }),
      )
    ) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForDeleteTenantUserPermission(able: Able<IAuthTenantUser>, tenantId: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.DeleteAnyUser) < 0 && tenantId !== currentUser.tenantId) {
    if (able.cannot(Actions.delete, subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId}))) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  async checkForUpdatePermissions(able: Able<IAuthTenantUser>, userId: string, tenantId?: string) {
    // if (currentUser.permissions.indexOf(PermissionKey.UpdateOwnUser) >= 0 && currentUser.id !== id) {
    if (able.cannot(Actions.update, subjectFor<UserTenant>(UserAuthSubjects.UserTenant, {tenantId, userId: userId}))) {
      throw new AclErrors.NotAllowedAccess();
    }
  }

  protected async validateIdentifierExists(
    id: string,
    identifier: string,
    prop: 'username' | 'email' | 'phone',
    options?: Options,
  ) {
    if (!identifier) {
      throw new BErrors.BadRequest(`${prop} is required`);
    }

    const whereBuilder = new WhereBuilder();
    whereBuilder.neq('id', id);
    whereBuilder.eq(prop, identifier);
    const identifierExists = await this.userRepo.count(whereBuilder.build(), options);
    if (identifierExists && identifierExists.count > 0) {
      throw new BErrors.Forbidden(`${prop} already exists`);
    }
  }
}
