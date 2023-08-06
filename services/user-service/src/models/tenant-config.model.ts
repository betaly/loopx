import {belongsTo, model, property} from '@loopback/repository';

import {ConfigKey, UserUpdatableEntity} from '@loopx/core';

import {Tenant, TenantWithRelations} from './index';

@model({
  name: 'tenant_configs',
})
export class TenantConfig extends UserUpdatableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    name: 'config_key',
  })
  configKey: ConfigKey;

  @property({
    type: 'object',
    name: 'config_value',
  })
  configValue?: object;

  @belongsTo(
    () => Tenant,
    {keyFrom: 'tenant_id', name: 'tenant'},
    {
      name: 'tenant_id',
      required: true,
    },
  )
  tenantId: string;

  constructor(data?: Partial<TenantConfig>) {
    super(data);
  }
}

export interface TenantConfigRelations {
  tenant: TenantWithRelations;
}

export type TenantConfigWithRelations = TenantConfig & TenantConfigRelations;
