import {model, property} from '@loopback/repository';

import {IAuthClient} from '@bleco/authentication';

import {ModelTypes, UserUpdatableEntity} from '@loopx/core';

@model({
  name: 'auth_clients',
})
export class AuthClient extends UserUpdatableEntity implements IAuthClient {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

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
    required: true,
    name: 'client_id',
  })
  clientId: string;

  @property({
    type: 'string',
    required: true,
    name: 'client_secret',
  })
  clientSecret: string;

  @property({
    type: 'string',
    required: true,
  })
  secret: string;

  @property({
    type: 'string',
    name: 'redirect_url',
  })
  redirectUrl?: string;

  @property({
    type: 'string',
    name: 'logout_redirect_url',
  })
  logoutRedirectUrl?: string;

  @property({
    type: 'number',
    required: true,
    name: 'access_token_expiration',
    description: 'Expires in seconds',
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

  constructor(data?: Partial<AuthClient>) {
    super(data);
  }
}

export type AuthClientTypes = ModelTypes<AuthClient, typeof AuthClient.prototype.id>;
