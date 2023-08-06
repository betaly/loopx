import {Model, model, property} from '@loopback/repository';

import {ModelPropertyDescriptionString} from '../modules/auth/models/model-property-description.enum';

@model()
export class SignupFastRequestDto extends Model {
  @property({
    type: 'string',
    description: ModelPropertyDescriptionString.reqStrPropDesc,
    required: true,
  })
  client_id: string; //NOSONAR

  @property({
    type: 'string',
    description: ModelPropertyDescriptionString.reqStrPropDesc,
  })
  client_secret: string; //NOSONAR

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    require: true,
  })
  password: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  constructor(data?: Partial<SignupFastRequestDto>) {
    super(data);
  }
}
