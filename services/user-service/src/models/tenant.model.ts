﻿import {hasMany, model, property} from '@loopback/repository';

import {TenantStatus, UserUpdatableEntity} from '@loopx/core';

import {TenantConfig, TenantConfigWithRelations, UserTenant, UserTenantWithRelations} from '../models';

@model({
  name: 'tenants',
  description: 'signature for all tenants',
})
export class Tenant extends UserUpdatableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
    description: 'Tenant status - Active or Inactive',
    jsonSchema: {
      enum: [TenantStatus.ACTIVE, TenantStatus.INACTIVE],
      nullable: true,
    },
  })
  status: TenantStatus;

  @property({
    type: 'string',
  })
  key?: string;

  @property({
    type: 'string',
  })
  website?: string;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
  })
  city?: string;

  @property({
    type: 'string',
  })
  state?: string;

  @property({
    type: 'string',
  })
  zip?: string;

  @property({
    type: 'string',
  })
  country?: string;

  @property({
    name: 'primary_contact_email',
    type: 'string',
  })
  primaryContactEmail: string;

  @property({
    name: 'allowed_domain',
    type: 'string',
  })
  allowedDomain: string;

  @property({
    name: 'tenant_type',
    type: 'string',
  })
  tenantType: string;

  @hasMany(() => TenantConfig, {keyTo: 'tenantId'})
  tenantConfigs: TenantConfig[];

  @hasMany(() => UserTenant, {keyTo: 'tenantId'})
  userTenants: UserTenant[];

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}

export interface TenantRelations {
  tenantConfigs: TenantConfigWithRelations[];
  userTenants: UserTenantWithRelations[];
}

export type TenantWithRelations = Tenant & TenantRelations;
