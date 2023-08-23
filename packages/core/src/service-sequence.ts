import {AuthenticateFn, AuthenticationBindings, AuthenticationErrors} from '@bleco/authentication';
import {AuthorizationBindings, AuthorizationErrors, AuthorizeFn} from '@bleco/authorization';
import {inject} from '@loopback/context';
import {
  ExpressRequestHandler,
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
import {BErrors} from 'berrors';
import {isString} from 'lodash';

import {IAuthUserWithPermissions, ILogger, LOGGER} from './components';
import {LxCoreBindings} from './keys';

const SequenceActions = RestBindings.SequenceActions;
const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export class ServiceSequence implements SequenceHandler {
  @inject(LxCoreBindings.EXPRESS_MIDDLEWARES, {optional: true})
  protected expressMiddlewares: ExpressRequestHandler[] = [];

  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD)
    protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthenticationBindings.USER_AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn<IAuthUserWithPermissions>,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorisation: AuthorizeFn,
    @inject(LxCoreBindings.i18n)
    protected i18n: i18nAPI,
  ) {}

  async handle(context: RequestContext) {
    const requestTime = Date.now();
    try {
      const {request, response} = context;
      response.removeHeader('x-powered-by');
      this.logger.info(
        `Request ${request.method} ${request.url} started at ${requestTime.toString()}.
        Request Details
        Referer = ${request.headers.referer}
        User-Agent = ${request.headers['user-agent']}
        Remote Address = ${request.socket.remoteAddress}
        Remote Address (Proxy) = ${request.headers['x-forwarded-for']}`,
      );

      if (this.expressMiddlewares?.length) {
        const responseGenerated = await this.invokeMiddleware(context, this.expressMiddlewares);
        if (responseGenerated) return;
      }

      const finished = await this.invokeMiddleware(context);
      if (finished) return;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      const authUser: IAuthUserWithPermissions = await this.authenticateRequest(request, response);
      const isAccessAllowed: boolean = await this.checkAuthorisation(authUser?.permissions, request);
      if (!isAccessAllowed) {
        throw new AuthorizationErrors.NotAllowedAccess();
      }

      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.logger.error(
        `Request ${context.request.method} ${context.request.url} errored out. Error :: ${JSON.stringify(err)} ${err}`,
      );

      const error = this._rejectErrors(err);
      if (
        // sonarignore:start
        !(
          error.message &&
          [AuthenticationErrors.TokenInvalid.message, AuthenticationErrors.TokenExpired.message].includes(error.message)
        )
        // sonarignore:end
      ) {
        if (isString(error.message)) {
          error.message = this.i18n.__({
            phrase: error.message,
            locale: process.env.LOCALE ?? 'en',
          });
        } else {
          error.message = error.message || 'Some error occurred. Please try again';
        }
      }
      this.reject(context, error);
    } finally {
      this.logger.info(
        `Request ${context.request.method} ${context.request.url} Completed in ${Date.now() - requestTime}ms`,
      );
    }
  }

  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;
  // sonarignore:start

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private _rejectErrors(err: any) {
    // sonarignore:end
    if (!!err.table && !!err.detail) {
      if (err.code === '23505') {
        // Postgres unique index error
        return new BErrors.Conflict(`Unique constraint violation error ! ${err.detail}`);
      } else if (err.code === '23503') {
        // Postgres foreign key error
        return new BErrors.NotFound(`Related entity not found ! ${err.detail}`);
      } else if (err.code === '23502') {
        // Postgres not null constraint error
        return new BErrors.NotFound(`Not null constraint violation error ! ${err.detail}`);
      } else {
        return err as Error;
      }
    } else if (err.message && isJsonString(err.message) && JSON.parse(err.message).error) {
      return JSON.parse(err.message).error as Error;
    } else if (err.message?.message && isJsonString(err.message.message) && JSON.parse(err.message.message).error) {
      return JSON.parse(err.message.message).error as Error;
    } else if (err.name && err.name === 'PubNubError') {
      return new BErrors.UnprocessableEntity(`Pubnub returned with error ! ${JSON.stringify(err)}`);
    } else {
      return err as Error;
    }
  }
}
