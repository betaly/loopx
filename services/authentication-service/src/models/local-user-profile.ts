import {Model, model, property} from '@loopback/repository';

import {ModelPropertyDescriptionString} from '../modules/auth/models/model-property-description.enum';

export interface LocalUserEmailPasswordProfile {
  email: string;
  password: string;
}

@model({
  settings: {
    strict: false,
  },
})
export class LocalUserEmailPasswordProfileDto extends Model implements Omit<LocalUserEmailPasswordProfile, 'clientId'> {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data?: Partial<LocalUserEmailPasswordProfileDto>) {
    super(data);
  }
}

export interface LocalUserProfile {
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
}

@model({
  settings: {
    strict: false,
  },
})
export class LocalUserProfileDto extends Model implements Omit<LocalUserProfile, 'clientId'> {
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
  })
  username?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  password?: string;

  constructor(data?: Partial<LocalUserProfileDto>) {
    super(data);
  }
}
