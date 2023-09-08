import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, param, patch, post, put, requestBody} from '@loopback/rest';
import {IAuthTenantUser, OPERATION_SECURITY_SPEC} from '@loopx/core';
import {AuthClient, AuthClientRepository, AuthClientService, Tenant, UserAuthSubjects} from '@loopx/user-core';
import {Actions, authorise} from 'loopback4-acl';

import {UserServiceBindings} from '../keys';
import {AuthClientRequestDto} from '../models';

@api({
  basePath: '/auth',
})
export class AuthClientsController {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @service(AuthClientService)
    public authClientService: AuthClientService,
    @inject(UserServiceBindings.DEFAULT_TENANT)
    public defaultTenant: Tenant,
    @inject(AuthenticationBindings.CURRENT_USER)
    public currentUser: IAuthTenantUser,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.CreateAuthClients],
  // })
  @authorise(Actions.create, UserAuthSubjects.AuthClient)
  @post('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthClient model instance',
        content: {'application/json': {schema: getModelSchemaRef(AuthClient)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthClientRequestDto, {
            title: 'NewAuthSecureClient',
          }),
        },
      },
    })
    dto: AuthClientRequestDto,
  ): Promise<AuthClient> {
    // this.checkUserDefaultTenantAccess();

    return this.authClientService.create(dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAuthClients,
  //     PermissionKey.DeleteAuthClients,
  //     PermissionKey.CreateAuthClients,
  //     PermissionKey.UpdateAuthClients,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.AuthClient)
  @get('/clients/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthClient model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(AuthClient) where?: Where<AuthClient>): Promise<Count> {
    // this.checkUserDefaultTenantAccess();

    return this.authClientRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAuthClients,
  //     PermissionKey.DeleteAuthClients,
  //     PermissionKey.CreateAuthClients,
  //     PermissionKey.UpdateAuthClients,
  //   ],
  // })
  @authorise(Actions.create, UserAuthSubjects.AuthClient)
  @get('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of AuthClient model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(AuthClient, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(AuthClient) filter?: Filter<AuthClient>): Promise<AuthClient[]> {
    // this.checkUserDefaultTenantAccess();

    return this.authClientRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  // })
  @authorise(Actions.update, UserAuthSubjects.AuthClient)
  @patch('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthClient PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthClient, {partial: true}),
        },
      },
    })
    dto: AuthClientRequestDto,
    @param.where(AuthClient) where?: Where<AuthClient>,
  ): Promise<Count> {
    // this.checkUserDefaultTenantAccess();

    return this.authClientRepository.updateAll(dto, where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAuthClients,
  //     PermissionKey.DeleteAuthClients,
  //     PermissionKey.CreateAuthClients,
  //     PermissionKey.UpdateAuthClients,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.AuthClient)
  @get('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthClient model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AuthClient, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(AuthClient, {exclude: 'where'}) filter?: FilterExcludingWhere<AuthClient>,
  ): Promise<AuthClient> {
    // this.checkUserDefaultTenantAccess();

    return this.authClientRepository.findById(id, filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  // })
  @authorise(Actions.update, UserAuthSubjects.AuthClient)
  @patch('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthClient PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthClientRequestDto, {partial: true}),
        },
      },
    })
    dto: AuthClientRequestDto,
  ): Promise<void> {
    // this.checkUserDefaultTenantAccess();

    await this.authClientRepository.updateById(id, dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  // })
  @authorise(Actions.update, UserAuthSubjects.AuthClient)
  @put('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthClient PUT success',
      },
    },
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() dto: AuthClientRequestDto): Promise<void> {
    // this.checkUserDefaultTenantAccess();

    await this.authClientRepository.replaceById(id, dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.DeleteAuthClients],
  // })
  @authorise(Actions.delete, UserAuthSubjects.AuthClient)
  @del('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthClient DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    // this.checkUserDefaultTenantAccess();

    await this.authClientRepository.deleteById(id);
  }

  // private checkUserDefaultTenantAccess() {
  //   if (this.currentUser.tenantId !== this.defaultTenant.id) {
  //     throw new AuthorizationErrors.NotAllowedAccess();
  //   }
  // }
}
