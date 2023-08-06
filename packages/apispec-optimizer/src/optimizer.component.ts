import {Binding, Component, createBindingFromClass} from '@loopback/core';

import {ApiSpecOptimizer} from './optimizer.spec-enhancer';

export class ApiSpecOptimizerComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(ApiSpecOptimizer)];
}
