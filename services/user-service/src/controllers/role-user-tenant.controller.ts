import {authenticate, STRATEGY} from '@bleco/authentication';
import {Count, CountSchema, Filter, repository, Where, WhereBuilder} from '@loopback/repository';
import {del, get, getModelSchemaRef, getWhereSchemaFor, param, patch, post, requestBody} from '@loopback/rest';
import {CONTENT_TYPE, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';
import {Role, RoleRepository, UserAuthSubjects, UserTenant, UserTenantRepository} from '@loopx/user-core';
import {Actions, authorise} from 'loopback4-acl';

const basePath = '/roles/{id}/ut';

export class RoleUserTenantController {
  constructor(
    @repository(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @repository(UserTenantRepository)
    private readonly utRepo: UserTenantRepository,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.ViewRoles, PermissionKey.ViewRolesNum],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({role: params.id}))
  @get(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Array of Role has many UserTenant',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserTenant),
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<UserTenant>,
  ): Promise<UserTenant[]> {
    return this.roleRepository.userTenants(id).find(filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.ViewRoles, PermissionKey.ViewRolesNum],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenant, async ({params}) => ({role: params.id}))
  @get(`${basePath}/count`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User tenant count for specified role id',
        content: {[CONTENT_TYPE.JSON]: {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(UserTenant))
    where?: Where<UserTenant>,
  ): Promise<Count> {
    const whereBuilder = new WhereBuilder(where);
    whereBuilder.eq('roleId', id);
    return this.utRepo.count(whereBuilder.build());
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.NotAllowed, PermissionKey.NotAllowedNum],
  // })
  @authorise(Actions.create, UserAuthSubjects.UserTenant, async ({params}) => ({role: params.id}))
  @post(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Role model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(UserTenant)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Role.prototype.id,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserTenant, {
            title: 'NewUserTenantInRole',
            exclude: ['id'],
            optional: ['roleId'],
          }),
        },
      },
    })
    userTenant: Omit<UserTenant, 'id'>,
  ): Promise<UserTenant> {
    return this.roleRepository.userTenants(id).create(userTenant);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.NotAllowed, PermissionKey.NotAllowedNum],
  // })
  @authorise(Actions.update, UserAuthSubjects.UserTenant, async ({params}) => ({role: params.id}))
  @patch(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Role.UserTenant PATCH success count',
        content: {[CONTENT_TYPE.JSON]: {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserTenant, {partial: true}),
        },
      },
    })
    userTenant: Partial<UserTenant>,
    @param.query.object('where', getWhereSchemaFor(UserTenant))
    where?: Where<UserTenant>,
  ): Promise<Count> {
    return this.roleRepository.userTenants(id).patch(userTenant, where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.NotAllowed, PermissionKey.NotAllowedNum],
  // })
  @authorise(Actions.delete, UserAuthSubjects.UserTenant, async ({params}) => ({role: params.id}))
  @del(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Role.UserTenant DELETE success count',
        content: {[CONTENT_TYPE.JSON]: {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(UserTenant))
    where?: Where<UserTenant>,
  ): Promise<Count> {
    return this.roleRepository.userTenants(id).delete(where);
  }
}
