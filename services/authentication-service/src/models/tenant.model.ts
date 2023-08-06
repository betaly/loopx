import {hasMany, model, property} from '@loopback/repository';

import {ModelTypes, TenantStatus, UserUpdatableEntity} from '@loopx/core';

import {TenantConfig} from './tenant-config.model';

@model({
  name: 'tenants',
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
    type: 'string',
    required: true,
  })
  key: string;

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
    type: 'number',
    required: true,
    description: 'Tenant status - Active or Inactive',
    jsonSchema: {
      enum: [TenantStatus.ACTIVE, TenantStatus.INACTIVE],
    },
  })
  status: TenantStatus;

  @hasMany(() => TenantConfig, {keyTo: 'tenantId'})
  tenantConfigs: TenantConfig[];

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}

export type TenantWithRelations = Tenant;

export type TenantTypes = ModelTypes<Tenant, typeof Tenant.prototype.id>;
