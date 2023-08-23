import {DataObject, model, property} from '@loopback/repository';
import {Model} from '@loopback/repository-json-schema';
import {UserStatus} from '@loopx/core';

@model()
export class UserDto extends Model {
  @property({
    type: 'string',
    required: true,
  })
  roleId: string;

  @property({
    type: 'string',
    required: true,
  })
  tenantId: string;

  @property({
    type: 'string',
    required: true,
  })
  userTenantId: string;

  @property({
    type: 'string',
    required: true,
  })
  username?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'string',
  })
  password?: string;

  @property({
    type: 'string',
  })
  status?: UserStatus;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;

  constructor(data?: DataObject<UserDto>) {
    super(data);
  }
}
