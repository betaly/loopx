import {ClientType, IAuthClient} from '@bleco/authentication';
import {DataObject, Model, model, property} from '@loopback/repository';
import {UserUpdatableEntity} from '@loopx/core';

@model({
  name: 'auth_clients',
})
export class AuthClient<T = DataObject<Model>> extends UserUpdatableEntity<T & AuthClient<T>> implements IAuthClient {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    name: 'name',
  })
  name?: string;

  @property({
    type: 'string',
    name: 'description',
  })
  description?: string;

  @property({
    type: 'string',
    name: 'client_type',
  })
  clientType: ClientType;

  @property({
    name: 'client_id',
    type: 'string',
    required: true,
  })
  clientId: string;

  @property({
    name: 'client_secret',
    type: 'string',
  })
  clientSecret: string;

  @property({
    type: 'string',
    name: 'redirect_url',
  })
  redirectUrl?: string;

  /**
   * @deprecated Use postLogoutRedirectUris instead
   */
  @property({
    type: 'string',
    name: 'logout_redirect_url',
  })
  logoutRedirectUrl?: string;

  @property({
    type: 'array',
    itemType: 'string',
    name: 'redirect_uris',
    default: [],
  })
  redirectUris?: string[];

  @property({
    type: 'array',
    itemType: 'string',
    name: 'post_logout_redirect_uris',
    default: [],
  })
  postLogoutRedirectUris: string[];

  @property({
    type: 'string',
    required: true,
  })
  secret: string;

  @property({
    type: 'number',
    required: true,
    name: 'access_token_expiration',
  })
  accessTokenExpiration: number;

  @property({
    type: 'number',
    required: true,
    name: 'refresh_token_expiration',
  })
  refreshTokenExpiration: number;

  @property({
    type: 'number',
    required: true,
    name: 'auth_code_expiration',
  })
  authCodeExpiration: number;
}
