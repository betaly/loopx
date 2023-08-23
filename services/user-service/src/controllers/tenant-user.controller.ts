import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {AuthorizationErrors, authorize} from '@bleco/authorization';
import {inject} from '@loopback/context';
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
import {CONTENT_TYPE, ErrorCodes, IAuthUserWithPermissions, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';
import {ITenant, MultiTenancyBindings} from '@loopx/multi-tenancy';

import {PermissionKey, RoleKey} from '../enums';
import {UserDto, UserView} from '../models';
import {NonRestrictedUserViewRepository, UserViewRepository} from '../repositories';
import {UserOperationsService} from '../services/user-operations.service';

const basePath = '/users';
const superAdminRoleType = 10;

export class TenantUserController {
  constructor(
    @repository(UserViewRepository)
    private readonly userViewRepo: UserViewRepository,
    @repository(NonRestrictedUserViewRepository)
    private readonly nonRestrictedUserViewRepo: NonRestrictedUserViewRepository,
    @inject('services.UserOperationsService')
    private readonly userOpService: UserOperationsService,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
      PermissionKey.ViewAnyUserNum,
      PermissionKey.ViewTenantUserNum,
      PermissionKey.ViewTenantUserRestrictedNum,
    ],
  })
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
    currentUser: IAuthUserWithPermissions,
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.query.object('filter', getFilterSchemaFor(UserView))
    filter?: Filter<UserView>,
  ): Promise<UserView[]> {
    if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    let whereClause = filter?.where;
    if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
      whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser, filter?.where);
    }

    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder<UserView>();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        tenantId: id,
      });
    } else {
      whereBuilder.eq('tenantId', id);
    }
    whereBuilder.neq('roleType', superAdminRoleType);
    filterBuilder.where(whereBuilder.build());
    if (+currentUser.role === RoleKey.SuperAdmin) {
      return this.nonRestrictedUserViewRepo.find(filterBuilder.build());
    }
    return this.userViewRepo.find(filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.ViewAllUser, PermissionKey.ViewAllUserNum],
  })
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
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.query.object('filter', getFilterSchemaFor(UserView))
    filter?: Filter<UserView>,
  ): Promise<UserView[]> {
    const filterBuilder = new FilterBuilder(filter);
    const whereBuilder = new WhereBuilder<UserView>();
    whereBuilder.eq('tenantId', id);
    whereBuilder.neq('roleType', superAdminRoleType);
    filterBuilder.where(whereBuilder.build());

    return this.nonRestrictedUserViewRepo.find(filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
      PermissionKey.ViewAnyUserNum,
      PermissionKey.ViewTenantUserNum,
      PermissionKey.ViewTenantUserRestrictedNum,
    ],
  })
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
    currentUser: IAuthUserWithPermissions,
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.query.object('where')
    where?: Where<UserView>,
  ): Promise<Count> {
    if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    let whereClause = where;
    if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
      whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser, where);
    }

    const whereBuilder = new WhereBuilder<UserView>();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        tenantId: id,
      });
    } else {
      whereBuilder.eq('tenantId', id);
    }
    whereBuilder.neq('roleType', superAdminRoleType);
    if (+currentUser.role === RoleKey.SuperAdmin) {
      return this.nonRestrictedUserViewRepo.count(whereBuilder.build());
    } else {
      return this.userViewRepo.count(whereBuilder.build());
    }
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewAnyUserNum,
      PermissionKey.ViewTenantUserNum,
      PermissionKey.ViewTenantUserRestrictedNum,
      PermissionKey.ViewOwnUserNum,
    ],
  })
  @get(`${basePath}/{userid}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User model instance',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(UserView, {
              includeRelations: true,
            }),
          },
        },
      },
    },
  })
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.path.string('userid') userId: string,
    @param.query.object('filter', getFilterSchemaFor(UserView))
    filter?: Filter<UserView>,
  ): Promise<UserView> {
    if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== id) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    if (currentUser.permissions.indexOf(PermissionKey.ViewOwnUser) >= 0 && currentUser.id !== userId) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    const filterBuilder = new FilterBuilder(filter);
    filterBuilder.where({
      tenantId: id,
    });

    return this.userViewRepo.findById(userId, filterBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.CreateAnyUser,
      PermissionKey.CreateTenantUser,
      PermissionKey.CreateTenantUserRestricted,
      PermissionKey.CreateAnyUserNum,
      PermissionKey.CreateTenantUserNum,
      PermissionKey.CreateTenantUserRestrictedNum,
    ],
  })
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
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
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
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
  ): Promise<UserDto> {
    if (!id) {
      throw new HttpErrors.BadRequest('Tenant Id not specified !');
    }
    userData.tenantId = id;
    userData.userDetails.email = userData.userDetails.email?.toLowerCase();
    userData.userDetails.username = userData.userDetails.username.toLowerCase();

    return this.userOpService.create(userData, currentUser, {
      authId: userData.authId,
      authProvider: userData.authProvider,
    });
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.UpdateAnyUser,
      PermissionKey.UpdateOwnUser,
      PermissionKey.UpdateTenantUser,
      PermissionKey.UpdateTenantUserRestricted,
      PermissionKey.UpdateAnyUserNum,
      PermissionKey.UpdateOwnUserNum,
      PermissionKey.UpdateTenantUserNum,
      PermissionKey.UpdateTenantUserRestrictedNum,
    ],
  })
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
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserView, {partial: true}),
        },
      },
    })
    user: Omit<UserView, 'id' | 'authClientIds' | 'lastLogin' | 'status' | 'tenantId'>,
  ): Promise<void> {
    if (currentUser.id === userId && user.roleId !== undefined) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }
    if (user.username) {
      user.username = user.username.toLowerCase();
    }
    await this.userOpService.updateById(currentUser, userId, user, id);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.DeleteAnyUser,
      PermissionKey.DeleteTenantUser,
      PermissionKey.DeleteTenantUserRestricted,
      PermissionKey.DeleteAnyUserNum,
      PermissionKey.DeleteTenantUserNum,
      PermissionKey.DeleteTenantUserRestrictedNum,
    ],
  })
  @del(`${basePath}/{userId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
    @inject(MultiTenancyBindings.CURRENT_TENANT)
    {id}: ITenant,
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    await this.userOpService.deleteById(currentUser, userId, id);
  }
}
