import {model, property} from '@loopback/repository';
import {CoreModel} from '@loopx/core';
import {AuthClient} from '@loopx/user-core';

@model()
export class AuthClientRequestDto extends CoreModel<AuthClientRequestDto> implements Partial<AuthClient> {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
    name: 'redirect_url',
  })
  redirectUrl?: string;

  @property({
    type: 'string',
  })
  logoutRedirectUrl?: string;

  @property({
    type: 'number',
    description: 'Expires in seconds',
  })
  accessTokenExpiration?: number;

  @property({
    type: 'number',
    description: 'refreshTokenExpiration in seconds',
  })
  refreshTokenExpiration?: number;

  @property({
    type: 'number',
    description: 'authCodeExpiration in seconds',
  })
  authCodeExpiration?: number;
}
