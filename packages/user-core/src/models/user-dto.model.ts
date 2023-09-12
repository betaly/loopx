import {model, property} from '@loopback/repository';

import {User} from './user.model';
import {UserCreationData} from './user-creatation-data.model';

@model()
export class UserDto extends UserCreationData {
  @property({
    type: 'number',
  })
  status?: number;

  @property({
    name: 'user_tenant_id',
    type: 'string',
    required: false,
  })
  userTenantId: string;

  userDetails: User;

  constructor(data?: Partial<UserDto>) {
    super(data);
  }
}
