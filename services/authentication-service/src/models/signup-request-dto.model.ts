import {AnyObject, Model, model, property} from '@loopback/repository';

import {ModelPropertyDescriptionString} from '../modules/auth/models/model-property-description.enum';

@model()
export class SignupRequestDto<T = AnyObject> extends Model {
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
  email: string;

  @property({
    type: 'object',
    required: false,
  })
  data?: T;

  constructor(data?: Partial<SignupRequestDto<T>>) {
    super(data);
  }
}
