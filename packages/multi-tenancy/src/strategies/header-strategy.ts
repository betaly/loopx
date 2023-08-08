import debugFactory from 'debug';

import {inject} from '@loopback/core';
import {RequestContext} from '@loopback/rest';

import {MultiTenancyBindings} from '../keys';
import {MultiTenancyStrategy, TenantResolverFn} from '../types';

const debug = debugFactory('loopx:multi-tenancy:strategy:header');

export const TENANT_ID_HEADER = 'x-tenant-id';
/**
 * Use `x-tenant-id` http header to identify the tenant id
 */
export class HeaderStrategy implements MultiTenancyStrategy {
  name = 'header';

  constructor(
    @inject(MultiTenancyBindings.TENANT_RESOLVER)
    private readonly resolveTenant: TenantResolverFn,
  ) {}

  async identifyTenant(requestContext: RequestContext) {
    const tenantId = requestContext.request.headers[TENANT_ID_HEADER] as string;
    debug(TENANT_ID_HEADER, tenantId);
    return tenantId == null ? undefined : this.resolveTenant(tenantId);
  }
}
