# @loopx/multi-tenancy

> An extension extracts tenant from request for LoopBack 4

## Key artifacts

### MultiTenancyStrategy

This interface defines the contract for multi-tenancy strategies to implement the logic to identify a tenant and bind
tenant specific resources to the request context.

```ts
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
```

### MultiTenancyActionProvider

`MultiTenancyActionProvider` serves two purposes:

- Provides an action (`IdentifyTenantFn`) for the REST sequence to enforce multi-tenancy
- Exposes an extension point to plug in multi-tenancy strategies

### Implement MultiTenancyStrategy

The example includes a few simple implementations of `MultiTenancyStrategy`:

#### Identify tenant id for a given http request

- JWTStrategy - use JWT token from `Authorization` header
- HeaderStrategy - use `x-tenant-id` header
- QueryStrategy - use `tenant-id` query parameter
- HostStrategy - use `host` header

### Register multi-tenancy strategies

Multi-tenancy strategies are registered to the extension point using `extensionFor` template:

```ts
app.add(createBindingFromClass(JWTStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)));
```

We group multiple registrations in `src/multi-tenancy/component.ts` using the `MultiTenancyComponent`:

```ts
export class MultiTenancyComponent implements Component {
  bindings = [
    // Add strategies
    createBindingFromClass(JWTStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    createBindingFromClass(HeaderStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    createBindingFromClass(QueryStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
    createBindingFromClass(HostStrategy).apply(extensionFor(MULTI_TENANCY_STRATEGIES)),
  ];
}
```

### Use multi-tenancy middleware or action

#### Configure multi-tenancy component

```ts
app.bind(MultiTenancyBindings.CONFIG).to({
  asMiddleware: true, // enable multi-tenancy middleware. default to false
  strategyNames: ['jwt', 'header', 'query'], // indentify tenant id using these strategies in order. default is ['header']
  defaultTenantId: 'default', // default tenant id if no tenant is identified. default is disabled.
});
```

#### Enable multi-tenancy middleware

The multi-tenancy middleware is disabled by default. You can enable it by setting `asMiddleware` to enable it.

```ts
app.bind(MultiTenancyBindings.CONFIG).to({asMiddleware: true});
```

#### Register tenant identify action

Tenant identify function is added to `src/sequence.ts` so that REST requests will be intercepted to enforce multiple
tenancy before other actions.

```ts
export class MySequence implements SequenceHandler {
  constructor(
    // ...
    @inject(MultiTenancyBindings.ACTION)
    public identifyTenant: IdentifyTenantFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      await this.identifyTenant(context);
      // ...
    } catch (err) {
      this.reject(context, err);
    }
  }
}
```

### Configure what strategies to be used

The tenant identify function can be configured with what strategies are checked in order.

```ts
app.configure<MultiTenancyActionOptions>(MultiTenancyBindings.ACTION).to({strategyNames: ['jwt', 'header', 'query']});
```

or

```ts
app.bind(MultiTenancyBindings.CONFIG).to({
  //...
  strategyNames: ['jwt', 'header', 'query'],
});
```

### Configure what default tenant to be used if no tenant is identified

```ts
app.bind(MultiTenancyBindings.CONFIG).to({
  //...
  defaultTenantId: 'default',
});
```

### Post-processing after tenant is identified

We simply rebind `datasources.db` to a tenant specific datasource to select the right datasource for `UserRepository`.

```ts
app.bind(MultiTenancyBindings.POST_PROCESS).to((ctx, tenant) => {
  ctx.bind('datasources.db').toAlias(`datasources.db.${tenant.id}`);
});
```

## Usage

See [application.ts](src/__tests__/fixtures/application.ts) for examples.

The strategies expect clients to set tenant id for REST API requests.

- `jwt`: set `Authorization` header as `Authorization: Bearer <signed-jwt-token>`
- `header`: set `x-tenant-id` header as `x-tenant-id: <tenant-id>`
- `query`: set `tenant-id` query parameter, such as: `?tenant-id=<tenant-id>`

Check out acceptance tests to understand how to pass tenant id using different strategies:

- src/tests/acceptance/user.controller.header.acceptance.ts
- src/tests/acceptance/user.controller.jwt.acceptance.ts

You can use environment variable `DEBUG=loopx:multi-tenancy:*` to print out information about the multi-tenancy actions.

## Tests

Run `yarn test` from the root folder.

## Contributors

See [all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
