import {authenticate, STRATEGY} from '@bleco/authentication';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {CONTENT_TYPE, STATUS_CODE} from '@loopx/core';
import {
  User,
  UserAuthSubjects,
  UserOperationsService,
  UserTenantRepository,
  UserViewRepository,
} from '@loopx/user-core';
import {UserView} from '@loopx/user-core/dist/models/user.view';
import {Actions, authorise} from 'loopback4-acl';

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
    @param.path.string('id')
    id: string,
  ): Promise<UserView> {
    const ut = await this.userTenantRepository.findById(id, {
      include: UserView.InclusionsForUserTenant,
    });
    return UserView.from(ut, ut.user, ut.tenant, ut.role);
  }
}
