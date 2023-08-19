import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  RequestWithSession,
  Response,
  RestBindings,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';

import {
  AuthenticationBindings,
  AuthenticationErrors,
  STRATEGY,
  authenticate,
  authenticateClient,
} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';

import {CONTENT_TYPE, ILogger, LOGGER, STATUS_CODE, X_TS_TYPE} from '@loopx/core';

import {AuthCodeBindings, AuthCodeGeneratorFn} from '../../providers';
import {AuthClientRepository} from '../../repositories';
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
      (req as RequestWithSession).session[LoginSessionKey] = {clientId: req.body.client_id};
      return {
        interactionMode: req.query.interaction_mode ?? req.query.interactionMode,
      };
    },
  )
  @authorize({permissions: ['*']})
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
      (req as RequestWithSession).session[LoginSessionKey] = {clientId: req.body.client_id};
      return {
        interactionMode: req.query.interaction_mode ?? req.query.interactionMode,
      };
    },
  )
  @authorize({permissions: ['*']})
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
  @authorize({permissions: ['*']})
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
    @param.query.string('code') code: string,
    // @param.query.string('state') state: string,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<void> {
    const {clientId} = request.session[LoginSessionKey];
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
      response.redirect(`${client.redirectUrl}?code=${token}`);
    } catch (error) {
      this.logger.error(error);
      throw new AuthenticationErrors.InvalidCredentials();
    }
  }
}
