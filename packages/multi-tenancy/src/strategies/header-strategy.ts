import {inject} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';

import {MultiTenancyBindings} from '../keys';
import {MultiTenancyStrategy, TenantResolverFn} from '../types';

const debug = debugFactory('loopx:multi-tenancy:strategy:header');

export const TENANT_HEADER_NAME = 'x-tenant-id';
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
    const tenantId = requestContext.request.headers[TENANT_HEADER_NAME] as string;
    debug(TENANT_HEADER_NAME, tenantId);
    return tenantId == null ? undefined : this.resolveTenant(tenantId);
  }
}
