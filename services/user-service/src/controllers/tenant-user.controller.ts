import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {Count, CountSchema, Filter, FilterBuilder, repository, Where, WhereBuilder} from '@loopback/repository';
import {
  del,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {CONTENT_TYPE, ErrorCodes, IAuthTenantUser, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';
import {
  DefaultRole,
  NonRestrictedUserViewRepository,
  User,
  UserAuthSubjects,
  UserDto,
  UserOperationsService,
  UserViewRepository,
} from '@loopx/user-core';
import {Able, acl, Actions, authorise} from 'loopback4-acl';

const basePath = '/tenants/{id}/users';

export class TenantUserController {
  constructor(
    @repository(UserViewRepository)
    private readonly userViewRepo: UserViewRepository,
    @repository(NonRestrictedUserViewRepository)
    private readonly nonRestrictedUserViewRepo: NonRestrictedUserViewRepository,
    @service(UserOperationsService)
    private readonly userOpService: UserOperationsService,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({tenantId: params.id}))
  @get(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      ...ErrorCodes,
      [STATUS_CODE.OK]: {
        description: 'Array of Tenant has many Users',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {type: 'array', items: getModelSchemaRef(UserDto)},
          },
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthTenantUser,
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<User[]> {
    // if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }

    let whereClause;
    // if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
    //   whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser, filter?.where);
    // }

    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        'userTenants.tenantId': id,
      });
    } else {
      whereBuilder.eq('userTenants.tenantId', id);
    }
    whereBuilder.neq('userTenants.role.code', DefaultRole.SuperAdmin);
    filterBuilder.where(whereBuilder.build());
    if (currentUser.role === DefaultRole.SuperAdmin) {
      return this.nonRestrictedUserViewRepo.find(filterBuilder.build());
    }
    return this.userViewRepo.find(filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({tenantId: params.id}))
  @get(`${basePath}/view-all`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      ...ErrorCodes,
      [STATUS_CODE.OK]: {
        description: 'Array of Tenant has many Users',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {type: 'array', items: getModelSchemaRef(UserDto)},
          },
        },
      },
    },
  })
  async findAllUsers(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<User[]> {
    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('userTenants.tenantId', id);
    whereBuilder.neq('userTenants.role.code', DefaultRole.SuperAdmin);
    filterBuilder.where(whereBuilder.build());

    return this.nonRestrictedUserViewRepo.find(filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAnyUser,
  //     PermissionKey.ViewTenantUser,
  //     PermissionKey.ViewTenantUserRestricted,
  //     PermissionKey.ViewAnyUserNum,
  //     PermissionKey.ViewTenantUserNum,
  //     PermissionKey.ViewTenantUserRestrictedNum,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({tenantId: params.id}))
  @get(`${basePath}/count`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User model count',
        content: {[CONTENT_TYPE.JSON]: {schema: CountSchema}},
      },
    },
  })
  async count(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthTenantUser,
    @param.path.string('id') id: string,
    @param.query.object('where')
    where?: Where<User>,
  ): Promise<Count> {
    // if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }

    let whereClause;
    // if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
    //   whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser, where);
    // }

    const whereBuilder = new WhereBuilder();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        'userTenants.tenantId': id,
      });
    } else {
      whereBuilder.eq('userTenants.tenantId', id);
    }
    whereBuilder.neq('userTenants.role.code', DefaultRole.SuperAdmin);
    if (currentUser.role === DefaultRole.SuperAdmin) {
      return this.nonRestrictedUserViewRepo.count(whereBuilder.build());
    } else {
      return this.userViewRepo.count(whereBuilder.build());
    }
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAnyUser,
  //     PermissionKey.ViewTenantUser,
  //     PermissionKey.ViewTenantUserRestricted,
  //     PermissionKey.ViewOwnUser,
  //     PermissionKey.ViewAnyUserNum,
  //     PermissionKey.ViewTenantUserNum,
  //     PermissionKey.ViewTenantUserRestrictedNum,
  //     PermissionKey.ViewOwnUserNum,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({
    tenantId: params.id,
    userId: params.userId,
  }))
  @get(`${basePath}/{userId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User model instance',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(User, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthTenantUser,
    @param.path.string('id') id: string,
    @param.path.string('userId') userId: string,
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<User> {
    // if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }
    //
    // if (currentUser.permissions.indexOf(PermissionKey.ViewOwnUser) >= 0 && currentUser.id !== userId) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }

    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('userTenants.tenantId', id);

    filterBuilder.where(whereBuilder.build());
    return this.userViewRepo.findById(userId, filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.CreateAnyUser,
  //     PermissionKey.CreateTenantUser,
  //     PermissionKey.CreateTenantUserRestricted,
  //     PermissionKey.CreateAnyUserNum,
  //     PermissionKey.CreateTenantUserNum,
  //     PermissionKey.CreateTenantUserRestrictedNum,
  //   ],
  // })
  @authorise(Actions.create, UserAuthSubjects.UserTenant, async ({params}) => ({tenantId: params.id}))
  @post(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      ...ErrorCodes,
      [STATUS_CODE.OK]: {
        description: 'Tenant model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(UserDto)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserDto, {
            title: 'NewUser',
            optional: ['tenantId'],
          }),
        },
      },
    })
    userData: UserDto,
    @acl.able()
    able: Able<IAuthTenantUser>,
  ): Promise<UserDto> {
    if (!id) {
      throw new HttpErrors.BadRequest('Tenant Id not specified !');
    }
    userData.tenantId = id;
    userData.details.email = userData.details.email?.toLowerCase();
    userData.details.username = userData.details.username.toLowerCase();

    return this.userOpService.create(userData, able, {
      authId: userData.authId,
      authProvider: userData.authProvider,
    });
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.UpdateAnyUser,
  //     PermissionKey.UpdateOwnUser,
  //     PermissionKey.UpdateTenantUser,
  //     PermissionKey.UpdateTenantUserRestricted,
  //     PermissionKey.UpdateAnyUserNum,
  //     PermissionKey.UpdateOwnUserNum,
  //     PermissionKey.UpdateTenantUserNum,
  //     PermissionKey.UpdateTenantUserRestrictedNum,
  //   ],
  // })
  @authorise(Actions.update, UserAuthSubjects.UserTenant, async ({params}) => ({
    tenantId: params.id,
    userId: params.userId,
  }))
  @patch(`${basePath}/{userId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.header.string('Authorization') token: string,
    @acl.able() able: Able<IAuthTenantUser>,
    @param.path.string('id') id: string,
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: Omit<User, 'id' | 'authClientIds' | 'lastLogin' | 'status' | 'tenantId'>,
  ): Promise<void> {
    // if (currentUser.id === userId && user.roleId !== undefined) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }
    if (user.username) {
      user.username = user.username.toLowerCase();
    }
    if (user.email) {
      user.email = user.email.toLowerCase();
    }
    await this.userOpService.updateById(able, userId, user, id);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.DeleteAnyUser,
  //     PermissionKey.DeleteTenantUser,
  //     PermissionKey.DeleteTenantUserRestricted,
  //     PermissionKey.DeleteAnyUserNum,
  //     PermissionKey.DeleteTenantUserNum,
  //     PermissionKey.DeleteTenantUserRestrictedNum,
  //   ],
  // })
  @authorise(Actions.delete, UserAuthSubjects.UserTenant, async ({params}) => ({
    tenantId: params.id,
    userId: params.userId,
  }))
  @del(`${basePath}/{userId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(
    @acl.able() able: Able<IAuthTenantUser>,
    @param.path.string('id') id: string,
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    await this.userOpService.deleteById(able, userId, id);
  }
}
