import {Application, BindingAddress, BindingKey, Component, Constructor, CoreBindings} from '@loopback/core';

import {MixinTarget} from '@bleco/mixin';

export function ComponentConfiguratorMixin<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    // Add a new method `componentWithConfig`
    public componentWithConfig<C extends Component = Component, CFG extends object = object>(
      componentCtor: Constructor<C>,
      config: CFG | BindingAddress<CFG>,
      componentConfigKey?: BindingAddress<CFG>,
    ) {
      const componentKey = BindingKey.create<C>(`${CoreBindings.COMPONENTS}.${componentCtor.name}`);

      if (isBindingAddress(config)) {
        if (componentConfigKey) {
          this.bind(componentConfigKey).toAlias(config);
        } else {
          this.configure(componentKey).toAlias(config);
        }
      } else {
        if (componentConfigKey) {
          this.bind(componentConfigKey).to(config);
        } else {
          this.configure(componentKey).to(config);
        }
      }

      this.component(componentCtor);

      return this;
    }
  };
}

function isBindingAddress<T>(x: unknown): x is BindingAddress<T> {
  if (x == null) return false;
  return (
    typeof x === 'string' ||
    (typeof x === 'object' &&
      'key' in x &&
      typeof x.key === 'string' &&
      'deepProperty' in x &&
      typeof x.deepProperty === 'function')
  );
}
