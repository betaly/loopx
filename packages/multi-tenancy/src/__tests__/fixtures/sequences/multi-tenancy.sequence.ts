import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';

import {IdentifyTenantFn, MultiTenancyBindings} from '../../../';

const SequenceActions = RestBindings.SequenceActions;

export class MyMultiTenancySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(MultiTenancyBindings.ACTION)
    protected identifyTenant: IdentifyTenantFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const finished = await this.invokeMiddleware(context);
      if (finished) {
        throw new Error('Middleware chain returned a finished response');
      }
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      request.body = args[args.length - 1];

      //call authentication action
      await this.identifyTenant(context);

      // Authentication successful, proceed to invoke controller
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
      return;
    }
  }

  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;
}
