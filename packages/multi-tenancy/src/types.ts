import {ValueOrPromise} from '@loopback/core';
import {RequestContext} from '@loopback/rest';

/**
 * Information about a tenant in the multi-tenancy environment
 */
export interface Tenant {
  id: string;
  [attribute: string]: unknown;
}

export interface MultiTenancyConfig {
  useMultiTenancyMiddleware?: boolean;
}

export interface MultiTenancyActionOptions {
  strategyNames: string[];
}

export type IdentifyTenantFn<T extends Tenant = Tenant> = (
  requestContext: RequestContext,
) => ValueOrPromise<T | undefined>;

/**
 * Interface for a multi-tenancy strategy to implement
 */
export interface MultiTenancyStrategy {
  /**
   * Name of the strategy
   */
  name: string;
  /**
   * Identify the tenant for a given http request
   * @param requestContext - Http request
   */
  identifyTenant(requestContext: RequestContext): ValueOrPromise<Tenant | undefined>;
}

/**
 * A function to be called after the tenant is identified
 */
export type MultiTenancyPostProcess = (requestContext: RequestContext, tenant: Tenant) => ValueOrPromise<void>;

/**
 * A function to be called to resolve the tenant for a given id
 */
export type TenantResolverFn = (idOrHost: string) => ValueOrPromise<Tenant | undefined>;
