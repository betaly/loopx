import {BindingKey} from '@loopback/core';

import {ApiSpecOptimizerOptions} from './optimizer.spec-enhancer';

export namespace ApiSpecOptimizerBindings {
  /**
   * Strongly-typed binding key for ApiSpecOptimizer
   */
  export const API_SPEC_OPTIMIZER = BindingKey.create<ApiSpecOptimizerOptions>('oas-enhancer.ApiSpecOptimizer');
}
