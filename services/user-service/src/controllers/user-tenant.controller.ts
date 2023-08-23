import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {AuthorizationErrors, authorize} from '@bleco/authorization';
import {inject} from '@loopback/core';
import {FilterBuilder, FilterExcludingWhere, repository, WhereBuilder} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param} from '@loopback/rest';
import {CONTENT_TYPE, IAuthUserWithPermissions, STATUS_CODE} from '@loopx/core';

import {PermissionKey} from '../enums';
import {UserView} from '../models';
import {UserTenantRepository, UserViewRepository} from '../repositories';
import {UserOperationsService} from '../services';

export class UserTenantController {
  constructor(
    @repository(UserTenantRepository)
    protected readonly userTenantRepository: UserTenantRepository,
    @repository(UserViewRepository)
    protected readonly userViewRepository: UserViewRepository,
    @inject('services.UserOperationsService')
    private readonly userOpService: UserOperationsService,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAnyUser,
      PermissionKey.ViewOwnUser,
      PermissionKey.ViewTenantUser,
      PermissionKey.ViewTenantUserRestricted,
      PermissionKey.ViewAnyUserNum,
      PermissionKey.ViewOwnUserNum,
      PermissionKey.ViewTenantUserNum,
      PermissionKey.ViewTenantUserRestrictedNum,
    ],
  })
  @get('/user-tenants/{id}', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'UserView model instance',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(UserView, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
    @param.path.string('id') id: string,
    @param.filter(UserView, {exclude: 'where'})
    filter?: FilterExcludingWhere<UserView>,
  ): Promise<UserView> {
    const ut = await this.userTenantRepository.findById(id);
    if (currentUser.permissions.indexOf(PermissionKey.ViewAnyUser) < 0 && currentUser.tenantId !== ut.tenantId) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    if (currentUser.permissions.indexOf(PermissionKey.ViewOwnUser) >= 0 && currentUser.id !== ut.userId) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    let whereClause;
    if (currentUser.permissions.indexOf(PermissionKey.ViewTenantUserRestricted) >= 0 && currentUser.tenantId === id) {
      whereClause = await this.userOpService.checkViewTenantRestrictedPermissions(currentUser);
    }

    const filterBuilder = new FilterBuilder<UserView>(filter);
    const whereBuilder = new WhereBuilder<UserView>();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        userTenantId: id,
      });
    } else {
      whereBuilder.eq('userTenantId', id);
    }
    filterBuilder.where(whereBuilder.build());

    const userData = await this.userViewRepository.findOne(filterBuilder.build());

    if (!userData) {
      throw new HttpErrors.NotFound('User not found !');
    }
    return userData;
  }
}
