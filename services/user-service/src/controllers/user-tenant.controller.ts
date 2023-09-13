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
    let whereClause;
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
