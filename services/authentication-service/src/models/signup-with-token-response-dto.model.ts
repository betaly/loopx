import {Model, model, property} from '@loopback/repository';

@model()
export class SignupWithTokenResponseDto<T> extends Model {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'object',
    required: true,
  })
  user: T;

  constructor(data?: Partial<SignupWithTokenResponseDto<T>>) {
    super(data);
  }
}
