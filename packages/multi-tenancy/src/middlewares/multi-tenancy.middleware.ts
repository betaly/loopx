import {inject, injectable, Next, Provider} from '@loopback/core';
import {asMiddleware, Middleware, MiddlewareContext, RequestContext, RestMiddlewareGroups} from '@loopback/rest';

import {MultiTenancyBindings} from '../keys';
import {IdentifyTenantFn} from '../types';
import {MultiTenancyMiddlewareGroups} from './middleware-groups.enum';

/**
 * Provides the multi-tenancy action for a sequence
 */
@injectable(
  asMiddleware({
    group: MultiTenancyMiddlewareGroups.TENANCY,
    downstreamGroups: RestMiddlewareGroups.FIND_ROUTE,
  }),
)
export class MultiTenancyMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(MultiTenancyBindings.ACTION)
    private identifyTenant: IdentifyTenantFn,
  ) {}

  value() {
    return async (ctx: MiddlewareContext, next: Next) => {
      await this.identifyTenant(ctx as RequestContext);
      return next();
    };
  }
}
