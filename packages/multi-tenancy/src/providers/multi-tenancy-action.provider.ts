import {config, ContextTags, extensionPoint, extensions, Getter, inject, Provider} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import debugFactory from 'debug';

import {MULTI_TENANCY_STRATEGIES, MultiTenancyBindings} from '../keys';
import {IdentifyTenantFn, MultiTenancyActionOptions, MultiTenancyPostProcess, MultiTenancyStrategy} from '../types';

const debug = debugFactory('loopx:multi-tenancy');

const DEFAULT_STRATEGY_NAMES = ['header'];

/**
 * Provides the multi-tenancy action for a sequence
 */
@extensionPoint(MULTI_TENANCY_STRATEGIES, {
  tags: {
    [ContextTags.KEY]: MultiTenancyBindings.ACTION,
  },
})
export class MultiTenancyActionProvider implements Provider<IdentifyTenantFn> {
  constructor(
    @extensions()
    private readonly getMultiTenancyStrategies: Getter<MultiTenancyStrategy[]>,
    @inject(MultiTenancyBindings.POST_PROCESS, {optional: true})
    private readonly postProcess: MultiTenancyPostProcess,
    @config()
    private readonly options: MultiTenancyActionOptions = {},
    @inject(MultiTenancyBindings.CONFIG, {optional: true})
    optionsFromConfig?: MultiTenancyActionOptions,
  ) {
    this.options = {...optionsFromConfig, ...options};
  }

  value(): IdentifyTenantFn {
    return requestCtx => this.action(requestCtx);
  }

  /**
   * The implementation of authenticate() sequence action.
   * @param requestCtx
   */
  async action(requestCtx: RequestContext) {
    debug('Identifying tenant for request %s', requestCtx.basePath);
    const tenancy = await this.identifyTenancy(requestCtx);
    if (tenancy == null) return;
    debug('Tenant identified by strategy %s', tenancy.strategy, tenancy.tenant);
    debug('Binding resources for tenant', tenancy.tenant);
    requestCtx.bind(MultiTenancyBindings.CURRENT_TENANT).to(tenancy.tenant);
    await this.postProcess?.(requestCtx, tenancy.tenant);
    return tenancy.tenant;
  }

  private async identifyTenancy(requestCtx: RequestContext) {
    debug('Tenancy action is configured with', this.options);
    const {strategyNames = DEFAULT_STRATEGY_NAMES, defaultTenantId} = this.options ?? {};
    let strategies = await this.getMultiTenancyStrategies();
    strategies = strategies
      .filter(s => strategyNames.includes(s.name))
      .sort((a, b) => strategyNames.indexOf(a.name) - strategyNames.indexOf(b.name));
    if (debug.enabled) {
      debug(
        'Tenancy strategies',
        strategies.map(s => s.name),
      );
    }
    for (const strategy of strategies) {
      debug('Trying tenancy strategy %s', strategy.name);
      const tenant = await strategy.identifyTenant(requestCtx);
      if (tenant != null) {
        debug('Tenant is now identified by strategy %s', strategy.name, tenant);
        return {tenant, strategy: strategy.name};
      }
    }
    if (defaultTenantId != null) {
      debug('Using default tenant id', defaultTenantId);
      return {
        tenant: {id: defaultTenantId},
        strategy: 'default',
      };
    }
    debug('No tenant is identified');
    return undefined;
  }
}
