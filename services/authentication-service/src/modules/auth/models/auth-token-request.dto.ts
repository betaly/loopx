import {Model, model, property} from '@loopback/repository';

@model({
  description: 'This is the signature for requesting the accessToken and refreshToken.',
})
export class AuthTokenRequest extends Model {
  @property({
    type: 'string',
    required: true,
  })
  clientId: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  constructor(data?: Partial<AuthTokenRequest>) {
    super(data);
  }
}
