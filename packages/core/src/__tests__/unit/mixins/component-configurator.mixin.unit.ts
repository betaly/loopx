import {expect} from '@jest/globals';
import {Application, BindingScope, Component, CoreBindings} from '@loopback/core';

import {ComponentConfiguratorMixin} from '../../../mixins/component-configurator.mixin';

class MyComponent implements Component {}

const App = class extends ComponentConfiguratorMixin(Application) {};

describe('ComponentConfiguratorMixin (unit)', () => {
  it('adds the component with direct configuration', () => {
    const app = new App();

    // Mock component config
    const config = {foo: 'bar'};

    // Add component with direct configuration
    app.componentWithConfig(MyComponent, config);

    // Verify that the component has been bound
    const componentKey = `${CoreBindings.COMPONENTS}.${MyComponent.name}`;
    const componentInstance = app.getSync(componentKey);
    expect(componentInstance).toBeInstanceOf(MyComponent);

    // Verify that the config has been bound
    const configInstance = app.getConfigSync(componentKey);
    expect(configInstance).toEqual(config);
  });

  it('adds the component with configuration alias', () => {
    const app = new App();

    // Mock component config
    const config = {foo: 'bar'};

    // Bind config
    const configBindingKey = 'config';
    app.bind(configBindingKey).to(config).inScope(BindingScope.SINGLETON);

    // Add component with configuration alias
    app.componentWithConfig(MyComponent, configBindingKey);

    // Verify that the component has been bound
    const componentKey = `${CoreBindings.COMPONENTS}.${MyComponent.name}`;
    const componentInstance = app.getSync(componentKey);
    expect(componentInstance).toBeInstanceOf(MyComponent);

    // Verify that the config has been aliased
    const configInstance = app.getConfigSync(componentKey);
    expect(configInstance).toEqual(config);
  });

  it('adds the component with direct bind configuration', () => {
    const app = new App();

    // Mock component config
    const config = {foo: 'bar'};

    // Add component with direct bind configuration
    app.componentWithConfig(MyComponent, config, 'custom.config');

    // Verify that the component has been bound
    const componentKey = `${CoreBindings.COMPONENTS}.${MyComponent.name}`;
    const componentInstance = app.getSync(componentKey);
    expect(componentInstance).toBeInstanceOf(MyComponent);

    // Verify that the config has been bound
    const configInstance = app.getSync('custom.config');
    expect(configInstance).toEqual(config);
  });

  it('adds the component with bind configuration alias', () => {
    const app = new App();

    // Mock component config
    const config = {foo: 'bar'};

    // Bind config
    const configBindingKey = 'config';
    app.bind(configBindingKey).to(config).inScope(BindingScope.SINGLETON);

    // Add component with bind configuration alias
    app.componentWithConfig(MyComponent, configBindingKey, 'custom.config');

    // Verify that the component has been bound
    const componentKey = `${CoreBindings.COMPONENTS}.${MyComponent.name}`;
    const componentInstance = app.getSync(componentKey);
    expect(componentInstance).toBeInstanceOf(MyComponent);

    // Verify that the config has been aliased
    const configInstance = app.getSync('custom.config');
    expect(configInstance).toEqual(config);
  });
});
