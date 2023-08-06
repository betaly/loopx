import {model, property} from '@loopback/repository';

import {ClientType, IAuthSecureClient} from '@bleco/authentication';

import {ModelTypes} from '@loopx/core';

import {AuthClient} from './auth-client.model';

@model({
  name: 'auth_clients',
})
export class AuthSecureClient extends AuthClient implements IAuthSecureClient {
  @property({
    type: 'string',
    name: 'client_type',
    mysql: {
      columnName: 'client_type',
    },
  })
  clientType: ClientType;

  constructor(data?: Partial<AuthSecureClient>) {
    super(data);
  }
}

export type AuthSecureClientTypes = ModelTypes<AuthSecureClient, typeof AuthSecureClient.prototype.id>;
