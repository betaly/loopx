import {inject} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';
import {decode} from 'jsonwebtoken';

import {MultiTenancyBindings} from '../keys';
import {MultiTenancyStrategy, TenantResolverFn} from '../types';

const debug = debugFactory('loopx:multi-tenancy:strategy:jwt');

/**
 * Use jwt token to identify the tenant id
 */
export class JWTStrategy implements MultiTenancyStrategy {
  name = 'jwt';

  constructor(
    @inject(MultiTenancyBindings.TENANT_RESOLVER)
    private readonly resolveTenant: TenantResolverFn,
  ) {}

  identifyTenant(requestContext: RequestContext) {
    const authorization = requestContext.request.headers['authorization'] as string;
    debug('authorization', authorization);
    if (authorization?.startsWith('Bearer ')) {
      //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
      const parts = authorization.split(' ');
      const token = parts[1];
      debug('JWT token', authorization);
      const json = decode(token, {json: true});
      debug('Token', json);
      const tenantId = json?.tenantId;
      debug('Tenant id', tenantId);
      return tenantId == null ? undefined : this.resolveTenant(tenantId);
    }
  }
}
