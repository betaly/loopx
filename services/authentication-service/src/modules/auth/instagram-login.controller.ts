﻿import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  STRATEGY,
} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, Request, requestBody, Response, RestBindings} from '@loopback/rest';
import {CONTENT_TYPE, ILogger, LOGGER, STATUS_CODE, X_TS_TYPE} from '@loopx/core';
import {URLSearchParams} from 'url';

import {AuthCodeBindings, AuthCodeGeneratorFn} from '../../providers';
import {AuthClientRepository} from '../../repositories';
import {AuthUser} from './models/auth-user.model';
import {ClientAuthRequest} from './models/client-auth-request.dto';
import {TokenResponse} from './models/token-response.dto';

const queryGen = (from: 'body' | 'query') => {
  return (req: Request) => {
    return {
      state: `client_id=${req[from].client_id}`,
    };
  };
};

export class InstagramLoginController {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.INSTAGRAM_OAUTH2,
    {
      accessType: 'offline',
      authorizationURL: process.env.INSTAGRAM_AUTH_URL,
      callbackURL: process.env.INSTAGRAM_AUTH_CALLBACK_URL,
      clientID: process.env.INSTAGRAM_AUTH_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_AUTH_CLIENT_SECRET,
      tokenURL: process.env.INSTAGRAM_AUTH_TOKEN_URL,
    },
    queryGen('body'),
  )
  @authorize({permissions: ['*']})
  @post('/auth/instagram', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'POST Call for Instagram based login',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async postLoginViaInstagram(
    @requestBody({
      content: {
        [CONTENT_TYPE.FORM_URLENCODED]: {
          schema: getModelSchemaRef(ClientAuthRequest),
        },
      },
    })
    clientCreds?: ClientAuthRequest,
  ): Promise<void> {
    //do nothing
  }

  @authenticate(
    STRATEGY.INSTAGRAM_OAUTH2,
    {
      accessType: 'offline',
      authorizationURL: process.env.INSTAGRAM_AUTH_URL,
      callbackURL: process.env.INSTAGRAM_AUTH_CALLBACK_URL,
      clientID: process.env.INSTAGRAM_AUTH_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_AUTH_CLIENT_SECRET,
      tokenURL: process.env.INSTAGRAM_AUTH_TOKEN_URL,
    },
    queryGen('query'),
  )
  @authorize({permissions: ['*']})
  @get('/auth/instagram-auth-redirect', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Instagram Redirect Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async instagramCallback(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<void> {
    const clientId = new URLSearchParams(state).get('client_id');
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
