import {model, property} from '@loopback/repository';

import {CoreModel, UserStatus} from '@loopx/core';

@model()
export class UserDto extends CoreModel<UserDto> {
  @property({
    type: 'string',
  })
  roleId?: string;

  @property({
    type: 'string',
  })
  tenantId?: string;

  @property({
    type: 'string',
  })
  userTenantId?: string;

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string',
  })
  name?: string;

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
  firstName?: string;

  @property({
    type: 'string',
  })
  lastName?: string;
}
