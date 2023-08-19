import {model, property} from '@loopback/repository';

import {ClientType, IAuthSecureClient} from '@bleco/authentication';

import {AuthClient} from './auth-client.model';

@model({
  name: 'auth_clients',
})
export class AuthSecureClient extends AuthClient<AuthSecureClient> implements IAuthSecureClient {
  @property({
    type: 'string',
    name: 'client_type',
  })
  clientType: ClientType;
}
