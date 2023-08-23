import {inject} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';

import {MultiTenancyBindings} from '../keys';
import {MultiTenancyStrategy, TenantResolverFn} from '../types';

const debug = debugFactory('loopx:multi-tenancy:strategy:query');

/**
 * Use `tenant-id` http query parameter to identify the tenant id
 */
export class QueryStrategy implements MultiTenancyStrategy {
  name = 'query';

  constructor(
    @inject(MultiTenancyBindings.TENANT_RESOLVER)
    private readonly resolveTenant: TenantResolverFn,
  ) {}

  identifyTenant(requestContext: RequestContext) {
    const tenantId = requestContext.request.query['tenant-id'] as string;
    debug('tenant-id', tenantId);
    return tenantId == null ? undefined : this.resolveTenant(tenantId);
  }
}
