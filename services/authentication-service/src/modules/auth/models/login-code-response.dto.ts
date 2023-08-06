import {Model, model, property} from '@loopback/repository';

import {ModelPropertyDescriptionString} from './model-property-description.enum';

@model({
  description: 'This is the signature for login response of code.',
})
export class LoginCodeResponse extends Model {
  @property({
    type: 'string',
    description: ModelPropertyDescriptionString.reqStrPropDesc,
    required: true,
  })
  code: string;

  constructor(data?: Partial<LoginCodeResponse>) {
    super(data);
  }
}
