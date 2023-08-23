import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {AuthorizationErrors, authorize} from '@bleco/authorization';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, param, patch, post, put, requestBody} from '@loopback/rest';
import {IAuthUserWithPermissions, OPERATION_SECURITY_SPEC} from '@loopx/core';

import {PermissionKey} from '../enums';
import {UserTenantServiceBindings} from '../keys';
import {AuthClientRequestDto, AuthSecureClient, Tenant} from '../models';
import {AuthSecureClientRepository} from '../repositories';
import {AuthClientService} from '../services';

@api({
  basePath: '/auth',
})
export class AuthClientsController {
  constructor(
    @repository(AuthSecureClientRepository)
    public authSecureClientRepository: AuthSecureClientRepository,
    @service(AuthClientService)
    public authClientService: AuthClientService,
    @inject(UserTenantServiceBindings.DEFAULT_TENANT)
    public defaultTenant: Tenant,
    @inject(AuthenticationBindings.CURRENT_USER)
    public currentUser: IAuthUserWithPermissions,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.CreateAuthClients],
  })
  @post('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthSecureClient model instance',
        content: {'application/json': {schema: getModelSchemaRef(AuthSecureClient)}},
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
  ): Promise<AuthSecureClient> {
    this.checkUserDefaultTenantAccess();

    return this.authClientService.create(dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAuthClients,
      PermissionKey.DeleteAuthClients,
      PermissionKey.CreateAuthClients,
      PermissionKey.UpdateAuthClients,
    ],
  })
  @get('/clients/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthSecureClient model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(AuthSecureClient) where?: Where<AuthSecureClient>): Promise<Count> {
    this.checkUserDefaultTenantAccess();

    return this.authSecureClientRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAuthClients,
      PermissionKey.DeleteAuthClients,
      PermissionKey.CreateAuthClients,
      PermissionKey.UpdateAuthClients,
    ],
  })
  @get('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of AuthSecureClient model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(AuthSecureClient, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(AuthSecureClient) filter?: Filter<AuthSecureClient>): Promise<AuthSecureClient[]> {
    this.checkUserDefaultTenantAccess();

    return this.authSecureClientRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  })
  @patch('/clients', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthSecureClient PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthSecureClient, {partial: true}),
        },
      },
    })
    dto: AuthClientRequestDto,
    @param.where(AuthSecureClient) where?: Where<AuthSecureClient>,
  ): Promise<Count> {
    this.checkUserDefaultTenantAccess();

    return this.authSecureClientRepository.updateAll(dto, where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.ViewAuthClients,
      PermissionKey.DeleteAuthClients,
      PermissionKey.CreateAuthClients,
      PermissionKey.UpdateAuthClients,
    ],
  })
  @get('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'AuthSecureClient model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AuthSecureClient, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(AuthSecureClient, {exclude: 'where'}) filter?: FilterExcludingWhere<AuthSecureClient>,
  ): Promise<AuthSecureClient> {
    this.checkUserDefaultTenantAccess();

    return this.authSecureClientRepository.findById(id, filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  })
  @patch('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthSecureClient PATCH success',
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
    this.checkUserDefaultTenantAccess();

    await this.authSecureClientRepository.updateById(id, dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.DeleteAuthClients, PermissionKey.CreateAuthClients, PermissionKey.UpdateAuthClients],
  })
  @put('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthSecureClient PUT success',
      },
    },
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() dto: AuthClientRequestDto): Promise<void> {
    this.checkUserDefaultTenantAccess();

    await this.authSecureClientRepository.replaceById(id, dto);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.DeleteAuthClients],
  })
  @del('/clients/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'AuthSecureClient DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    this.checkUserDefaultTenantAccess();

    await this.authSecureClientRepository.deleteById(id);
  }

  private checkUserDefaultTenantAccess() {
    if (this.currentUser.tenantId !== this.defaultTenant.id) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }
  }
}
