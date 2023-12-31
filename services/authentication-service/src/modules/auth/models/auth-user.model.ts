﻿import {model, property} from '@loopback/repository';
import {IAuthTenantUser, IUserPrefs, UserStatus} from '@loopx/core';
import {User} from '@loopx/user-core';

export class DeviceInfo {
  userAgent?: string;
  deviceId?: string;
}

@model({
  description: `This is the signature for authenticated user which holds permissions and role.`,
  settings: {strict: true},
})
export class AuthUser extends User implements IAuthTenantUser {
  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions: string[];

  @property({
    type: 'string',
    required: true,
  })
  role: string;

  @property({
    type: 'object',
    description: `This property consists of two optional fields.
    1. userAgent
    2. deviceId `,
  })
  deviceInfo?: DeviceInfo;

  @property({
    type: 'number',
  })
  age?: number;

  @property({
    type: 'string',
  })
  externalAuthToken?: string;

  @property({
    type: 'string',
  })
  externalRefreshToken?: string;

  @property({
    type: 'number',
  })
  authClientId: number;

  @property({
    type: 'object',
  })
  userPreferences?: IUserPrefs;

  @property({
    type: 'string',
  })
  tenantId?: string;

  @property({
    type: 'string',
  })
  userTenantId?: string;

  @property({
    type: 'date',
  })
  passwordExpiryTime?: Date;

  @property({
    type: 'number',
    jsonSchema: {
      enum: [
        UserStatus.ACTIVE,
        UserStatus.INACTIVE,
        UserStatus.PASSWORD_CHANGE_NEEDED,
        UserStatus.REGISTERED,
        UserStatus.REJECTED,
      ],
    },
  })
  status?: UserStatus;

  constructor(data?: Partial<AuthUser>) {
    super(data);
  }

  getIdentifier() {
    return this.id;
  }
}
