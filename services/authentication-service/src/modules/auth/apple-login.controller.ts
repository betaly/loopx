﻿import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  STRATEGY,
} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, Request, requestBody, Response, RestBindings} from '@loopback/rest';
import {CONTENT_TYPE, ILogger, LOGGER, STATUS_CODE, X_TS_TYPE} from '@loopx/core';
import {AuthClientRepository} from '@loopx/user-core';
import {URLSearchParams} from 'url';

import {AuthCodeBindings, AuthCodeGeneratorFn, AuthPageBindings} from '../../providers';
import {AuthPages} from '../../types';
import {AuthUser} from './models/auth-user.model';
import {ClientAuthRequest} from './models/client-auth-request.dto';
import {TokenResponse} from './models/token-response.dto';
import {toQueryString} from './utils';

const queryGen = (from: 'body' | 'query') => {
  return (req: Request) => {
    return {
      state: toQueryString({
        client_id: req[from].client_id,
        response_mode: req.query.response_mode,
        state: req.query.state,
      }),
    };
  };
};

export class AppleLoginController {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
    @inject(AuthPageBindings.AUTH_PAGES_PROVIDER)
    private readonly authPages: AuthPages,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.APPLE_OAUTH2,
    {
      accessType: 'offline',
      scope: ['name', 'email'],
      callbackURL: process.env.APPLE_AUTH_CALLBACK_URL,
      clientID: process.env.APPLE_AUTH_CLIENT_ID,
      teamID: process.env.APPLE_AUTH_TEAM_ID,
      keyID: process.env.APPLE_AUTH_KEY_ID,
      privateKeyLocation: process.env.APPLE_AUTH_PRIVATE_KEY_LOCATION,
    },
    queryGen('body'),
  )
  @post('/auth/oauth-apple', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'POST Call for Apple based login',
        content: {},
      },
    },
  })
  postLoginViaApple(
    @requestBody({
      content: {
        [CONTENT_TYPE.FORM_URLENCODED]: {
          schema: getModelSchemaRef(ClientAuthRequest),
        },
      },
    })
    clientCreds: ClientAuthRequest,
  ): void {
    //do nothing
  }

  @authenticate(
    STRATEGY.APPLE_OAUTH2,
    {
      accessType: 'offline',
      scope: ['name', 'email'],
      callbackURL: process.env.APPLE_AUTH_CALLBACK_URL,
      clientID: process.env.APPLE_AUTH_CLIENT_ID,
      teamID: process.env.APPLE_AUTH_TEAM_ID,
      keyID: process.env.APPLE_AUTH_KEY_ID,
      privateKeyLocation: process.env.APPLE_AUTH_PRIVATE_KEY_LOCATION,
    },
    queryGen('query'),
  )
  @get('/auth/apple-oauth-redirect', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Apple Redirect Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async appleCallback(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<void> {
    const stateParams = new URLSearchParams(state);
    const clientId = stateParams.get('client_id');
    const clientState = stateParams.get('state');
    const responseMode = stateParams.get('response_mode');

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
      const role = user.role;
      if (responseMode === 'web_message') {
        return this.authPages.webMessage({code: token, state: clientState, role}, response);
      }
      response.redirect(
        `${process.env.WEBAPP_URL ?? ''}${client.redirectUrl}?${toQueryString({
          code: token,
          state: clientState,
          role,
        })}`,
      );
    } catch (error) {
      this.logger.error(error);
      throw new AuthenticationErrors.InvalidCredentials();
    }
  }
}
