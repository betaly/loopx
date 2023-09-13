import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {
  AnyObject,
  Count,
  CountSchema,
  Filter,
  FilterBuilder,
  repository,
  Where,
  WhereBuilder,
} from '@loopback/repository';
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
  TenantUserData,
  TenantUserView,
  User,
  UserAuthSubjects,
  UserOperationsService,
  UserViewRepository,
  UserWithRelations,
} from '@loopx/user-core';
import {Able, acl, Actions, authorise} from 'loopback4-acl';
import {UserView} from '@loopx/user-core/dist/models/user.view';
import {BErrors} from 'berrors';

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
            schema: {type: 'array', items: getModelSchemaRef(TenantUserView)},
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
  ): Promise<UserView[]> {
    let whereClause;
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
    filterBuilder.include(...UserView.InclusionsForUser);

    let users: UserWithRelations[];
    if (currentUser.role === DefaultRole.SuperAdmin) {
      users = await this.nonRestrictedUserViewRepo.find(filterBuilder.build());
    } else {
      users = await this.userViewRepo.find(filterBuilder.build());
    }

    return UserView.fromUsers(users);
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
            schema: {type: 'array', items: getModelSchemaRef(TenantUserView)},
          },
        },
      },
    },
  })
  async findAllUsers(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(User))
    filter?: Filter<User>,
  ): Promise<UserView[]> {
    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('userTenants.tenantId', id);
    whereBuilder.neq('userTenants.role.code', DefaultRole.SuperAdmin);
    filterBuilder.where(whereBuilder.build());
    filterBuilder.include(...UserView.InclusionsForUser);

    const users = await this.nonRestrictedUserViewRepo.find(filterBuilder.build());
    return UserView.fromUsers(users);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
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

    const whereBuilder = new WhereBuilder<AnyObject>(where);
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
  ): Promise<UserView> {
    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('userTenants.tenantId', id);
    filterBuilder.where(whereBuilder.build());

    filterBuilder.include(...UserView.InclusionsForUser);
    const user = await this.userViewRepo.findById(userId, filterBuilder.build());
    const result = UserView.fromUser(user, true);
    if (!result) {
      throw new BErrors.NotFound('User not found!');
    }
    return result;
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorise(Actions.create, UserAuthSubjects.UserTenant, async ({params, body}) => ({
    tenantId: params.id,
    role: body.roleId,
  }))
  @post(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      ...ErrorCodes,
      [STATUS_CODE.OK]: {
        description: 'Tenant model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(TenantUserView)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(TenantUserData, {
            title: 'NewUser',
            optional: ['tenantId'],
          }),
        },
      },
    })
    data: TenantUserData,
    @acl.able()
    able: Able<IAuthTenantUser>,
  ): Promise<TenantUserView> {
    if (!id) {
      throw new HttpErrors.BadRequest('Tenant Id not specified !');
    }
    data.tenantId = id;
    data.userDetails.email = data.userDetails.email?.toLowerCase();
    data.userDetails.username = data.userDetails.username?.toLowerCase();

    return this.userOpService.create(data, able, {
      authId: data.authId,
      authProvider: data.authProvider,
    });
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
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
