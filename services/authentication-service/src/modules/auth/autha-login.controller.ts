import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  STRATEGY,
} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  RequestWithSession,
  Response,
  RestBindings,
} from '@loopback/rest';
import {CONTENT_TYPE, ILogger, LOGGER, STATUS_CODE, X_TS_TYPE} from '@loopx/core';
import {AuthClientRepository} from '@loopx/user-core';

import {AuthCodeBindings, AuthCodeGeneratorFn, AuthPageBindings} from '../../providers';
import {AuthPages} from '../../types';
import {AuthUser} from './models/auth-user.model';
import {ClientAuthRequest} from './models/client-auth-request.dto';
import {TokenResponse} from './models/token-response.dto';

const AuthSessionKey = 'autha';
const LoginSessionKey = 'login';

export class AuthaLoginController {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
    @inject(AuthPageBindings.AUTH_PAGES_PROVIDER)
    private readonly authPages: AuthPages,
  ) {}

  // TODO
  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.AUTHA,
    {
      sessionKey: AuthSessionKey,
    },
    req => {
      // set the client id in the session for later use temporarily
      (req as RequestWithSession).session[LoginSessionKey] = {
        clientId: req.body.client_id,
        responseMode: req.query.response_mode,
        state: req.query.state,
      };
      return {
        interactionMode: req.query.interaction_mode ?? req.query.interactionMode,
      };
    },
  )
  @get('/auth/autha', {
    responses: {
      [STATUS_CODE.PERMANENT_REDIRECT]: {
        description: 'Redirect to Autha login page',
      },
    },
  })
  async loginViaAutha(
    @param.query.string('client_id')
    clientId?: string,
    @param.query.string('client_challenge')
    clientChallenge?: string,
    @param.query.string('client_challenge_method')
    clientChallengeMethod?: string,
  ): Promise<void> {
    //do nothing
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.AUTHA,
    {
      sessionKey: AuthSessionKey,
    },
    req => {
      // set the client id in the session for later use temporarily
      (req as RequestWithSession).session[LoginSessionKey] = {
        clientId: req.body.client_id,
        responseMode: req.query.response_mode,
        state: req.query.state,
      };
      return {
        interactionMode: req.query.interaction_mode ?? req.query.interactionMode,
      };
    },
  )
  @post('/auth/autha', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'POST Call for Autha based login',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async postLoginViaAutha(
    @requestBody({
      content: {
        [CONTENT_TYPE.FORM_URLENCODED]: {
          schema: getModelSchemaRef(ClientAuthRequest),
        },
      },
    })
    clientCreds: ClientAuthRequest,
  ): Promise<void> {
    //do nothing
  }

  @authenticate(
    STRATEGY.AUTHA,
    {
      sessionKey: AuthSessionKey,
    },
    req => ({}),
  )
  @get('/auth/autha-redirect', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Autha Redirect Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async authaCallback(
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<void> {
    const {clientId, state, responseMode} = request.session[LoginSessionKey];
    delete request.session[LoginSessionKey];
    if (!clientId || !user) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    const client = await this.authClientRepository.findOne({
      where: {
        clientId,
      },
    });
    if (!client?.redirectUrl) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    try {
      const token = await this.getAuthCode(client, user);
      if (responseMode === 'web_message') {
        return this.authPages.webMessage({code: token, state}, response);
      }
      response.redirect(`${client.redirectUrl}?${new URLSearchParams({code: token, state}).toString()}`);
    } catch (error) {
      this.logger.error(error);
      throw new AuthenticationErrors.UnknownError({cause: error});
    }
  }
}
