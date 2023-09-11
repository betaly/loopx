import {ValueOrPromise} from '@loopback/core';
import {RequestContext} from '@loopback/rest';

/**
 * Information about a tenant in the multi-tenancy environment
 */
export interface ITenant {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
}

export interface MultiTenancyActionOptions {
  defaultTenantId?: string;
  strategyNames?: string[];
}

export interface MultiTenancyConfig extends MultiTenancyActionOptions {
  asMiddleware?: boolean;
}

export type IdentifyTenantFn<T extends ITenant = ITenant> = (
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
  identifyTenant(requestContext: RequestContext): ValueOrPromise<ITenant | undefined>;
}

/**
 * A function to be called after the tenant is identified
 */
export type MultiTenancyPostProcess = (requestContext: RequestContext, tenant: ITenant) => ValueOrPromise<void>;

/**
 * A function to be called to resolve the tenant for a given id
 */
export type TenantResolverFn = (idOrHost: string) => ValueOrPromise<ITenant | undefined>;
