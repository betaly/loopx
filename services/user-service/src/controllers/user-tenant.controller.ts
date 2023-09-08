import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {inject, service} from '@loopback/core';
import {FilterBuilder, FilterExcludingWhere, repository, WhereBuilder} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param} from '@loopback/rest';
import {CONTENT_TYPE, IAuthTenantUser, STATUS_CODE} from '@loopx/core';
import {
  User,
  UserAuthSubjects,
  UserOperationsService,
  UserTenant,
  UserTenantRepository,
  UserViewRepository,
} from '@loopx/user-core';
import {acl, Actions, authorise} from 'loopback4-acl';

export class UserTenantController {
  constructor(
    @repository(UserTenantRepository)
    protected readonly userTenantRepository: UserTenantRepository,
    @repository(UserViewRepository)
    protected readonly userViewRepository: UserViewRepository,
    @service(UserOperationsService)
    private readonly userOpService: UserOperationsService,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAnyUser,
  //     PermissionKey.ViewOwnUser,
  //     PermissionKey.ViewTenantUser,
  //     PermissionKey.ViewTenantUserRestricted,
  //     PermissionKey.ViewAnyUserNum,
  //     PermissionKey.ViewOwnUserNum,
  //     PermissionKey.ViewTenantUserNum,
  //     PermissionKey.ViewTenantUserRestrictedNum,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, [
    UserTenantRepository,
    async (repo, {params}) => repo.findById(params.id),
  ])
  @get('/ut/{id}', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User model instance',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthTenantUser,
    @param.path.string('id')
    id: string,
    @acl.subject()
    ut: UserTenant,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    // const ut = await this.userTenantRepository.findById(id);
    // if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== ut.tenantId) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }
    //
    // if (currentUser.permissions.indexOf(PermissionKey.ViewOwnUser) >= 0 && currentUser.id !== ut.userId) {
    //   throw new AuthorizationErrors.NotAllowedAccess();
    // }

    let whereClause;
    // if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
    //   whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser);
    // }

    const filterBuilder = new FilterBuilder<User>(filter);
    const whereBuilder = new WhereBuilder();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        'userTenants.id': id,
      });
    } else {
      whereBuilder.eq('userTenants.id', id);
    }
    filterBuilder.where(whereBuilder.build());

    const userData = await this.userViewRepository.findOne(filterBuilder.build());

    if (!userData) {
      throw new HttpErrors.NotFound('User not found !');
    }
    return userData;
  }
}
