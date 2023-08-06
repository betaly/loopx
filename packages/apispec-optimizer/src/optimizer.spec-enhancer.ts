import {BindingScope, config, injectable} from '@loopback/core';
import {OperationObject, PathItemObject} from '@loopback/openapi-v3';
import {OASEnhancer, OpenApiSpec, asSpecEnhancer} from '@loopback/rest';

import {CrudOperationModifiers} from './modifiers';

export type ApiSpecOptimizerNameCustomizer = (name: string, op: OperationObject, spec: OpenApiSpec) => string;

export type ApiSpecOptimizerOptions = {
  customizeControllerName?: ApiSpecOptimizerNameCustomizer;
  customizeOperationId?: ApiSpecOptimizerNameCustomizer;
};

export const CONTROLLER_NAME = 'x-controller-name';
export const OPERATION_NAME = 'x-operation-name';

@injectable(asSpecEnhancer, {scope: BindingScope.SINGLETON})
export class ApiSpecOptimizer implements OASEnhancer {
  name = 'OpenAPI spec optimizer';

  private readonly customizeControllerName: ApiSpecOptimizerNameCustomizer;
  private readonly customizeOperationId: ApiSpecOptimizerNameCustomizer;

  constructor(
    @config({optional: true})
    private options: ApiSpecOptimizerOptions = {},
  ) {
    this.customizeControllerName = options.customizeControllerName ?? this.defaultCustomizeControllerName;
    this.customizeOperationId = options.customizeOperationId ?? this.defaultCustomizeOperationId;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const paths = spec.paths;
    Object.keys(paths).forEach(key => {
      const path: PathItemObject = paths[key];
      Object.keys(path).forEach(method => {
        const op: OperationObject = path[method as keyof PathItemObject];
        this.removeControllerSuffix(op);
        this.removeOperationIdPrefix(op);

        this.modifyControllerName(op, name => this.customizeControllerName(name, op, spec));
        this.modifyOperationId(op, name => this.customizeOperationId(name, op, spec));
      });
    });
    return spec;
  }

  private defaultCustomizeControllerName = (name: string, op: OperationObject, spec: OpenApiSpec) => {
    return name;
  };

  private defaultCustomizeOperationId = (name: string, op: OperationObject, spec: OpenApiSpec) => {
    return CrudOperationModifiers[name]?.(op[CONTROLLER_NAME]) ?? name;
  };

  private removeControllerSuffix(op: OperationObject) {
    this.modifyControllerName(op, name => name.replace(/Controller$/, ''));
  }

  private removeOperationIdPrefix(op: OperationObject) {
    this.modifyOperationId(op, name => {
      if (op[OPERATION_NAME]) {
        return op[OPERATION_NAME];
      }
      const i = name.lastIndexOf('.');
      return i > 0 ? name.slice(i + 1) : name;
    });
  }

  private modifyControllerName(op: OperationObject, customize: (name: string) => string) {
    if (op[CONTROLLER_NAME]) {
      op[CONTROLLER_NAME] = customize(op[CONTROLLER_NAME]);
    }

    if (op.tags) {
      op.tags = op.tags.map((tag: string) => customize(tag));
    }
  }

  private modifyOperationId(op: OperationObject, customize: (name: string) => string) {
    if (op.operationId) {
      op.operationId = customize(op.operationId);
    }
  }
}
