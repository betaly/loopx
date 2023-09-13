import {DataObject, model, property} from '@loopback/repository';
import {CoreModel} from '@loopx/core';

import {User} from './user.model';

@model()
export class TenantUserData extends CoreModel<TenantUserData> {
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
  })
  authProvider?: string;

  @property({
    type: 'string',
  })
  authId?: string;

  @property(() => User)
  userDetails: DataObject<User>;
}
