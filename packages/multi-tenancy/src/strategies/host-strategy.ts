import {inject} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';

import {MultiTenancyBindings} from '../keys';
import {ITenant, MultiTenancyStrategy, TenantResolverFn} from '../types';

const debug = debugFactory('loopx:multi-tenancy:strategy:host');
/**
 * Use `host` to identify the tenant id
 */
export class HostStrategy implements MultiTenancyStrategy {
  name = 'host';

  constructor(
    @inject(MultiTenancyBindings.TENANT_RESOLVER)
    private readonly resolveTenant: TenantResolverFn,
  ) {}

  identifyTenant(requestContext: RequestContext) {
    const host = requestContext.request.headers.host;
    debug('host', host);
    return this.mapHostToTenant(host);
  }

  async mapHostToTenant(host: string | undefined): Promise<ITenant | undefined> {
    if (host == null) return undefined;
    const hostname = host.split(':')[0];
    const tenant = await this.resolveTenant(hostname);
    debug('tenant id for host %s: %s', hostname, tenant?.id);
    if (tenant == null) return undefined;
    return tenant;
  }
}
