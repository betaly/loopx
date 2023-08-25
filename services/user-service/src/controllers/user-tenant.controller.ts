import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {AuthorizationErrors, authorize} from '@bleco/authorization';
import {inject} from '@loopback/core';
import {FilterBuilder, FilterExcludingWhere, repository, WhereBuilder} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param} from '@loopback/rest';
import {CONTENT_TYPE, IAuthUserWithPermissions, STATUS_CODE} from '@loopx/core';

import {PermissionKey} from '../enums';
import {User} from '../models';
import {UserRepository, UserTenantRepository} from '../repositories';
import {UserOperationsService} from '../services';
import {DefaultQuery, Query} from 'loopback4-query';

export class UserTenantController {
  protected userQuery: Query<User>;

  constructor(
    @repository(UserTenantRepository)
    protected readonly userTenantRepository: UserTenantRepository,
    @repository(UserRepository)
    protected readonly userRepository: UserRepository,
    @inject('services.UserOperationsService')
    private readonly userOpService: UserOperationsService,
  ) {
    this.userQuery = new DefaultQuery<User>(userRepository);
  }

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
    currentUser: IAuthUserWithPermissions,
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
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

    const filterBuilder = new FilterBuilder<User>(filter);
    const whereBuilder = new WhereBuilder<User>();
    if (whereClause) {
      whereBuilder.and(whereClause, {
        'userTenants.id': id,
      });
    } else {
      whereBuilder.eq('userTenants.id', id);
    }
    filterBuilder.where(whereBuilder.build());

    const userData = await this.userQuery.findOne(filterBuilder.build());

    if (!userData) {
      throw new HttpErrors.NotFound('User not found !');
    }
    return userData;
  }
}
