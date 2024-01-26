import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  STRATEGY,
} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, oas, param, post, Request, requestBody, Response, RestBindings} from '@loopback/rest';
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
        state: req.query.state,
      }),
    };
  };
};

export class KeycloakLoginController {
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
    STRATEGY.KEYCLOAK,
    {
      host: process.env.KEYCLOAK_HOST,
      realm: process.env.KEYCLOAK_REALM, //'Tenant1',
      clientID: process.env.KEYCLOAK_CLIENT_ID, //'onboarding',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      //'e607fd75-adc8-4af7-9f03-c9e79a4b8b72',
      callbackURL: process.env.KEYCLOAK_CALLBACK_URL,
      //'http://localhost:3001/auth/keycloak-auth-redirect',
      authorizationURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      tokenURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      userInfoURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
    },
    queryGen('body'),
  )
  @post('/auth/keycloak', {
    description: 'POST Call for keycloak based login',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Keycloak Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async postLoginViaKeycloak(
    @requestBody({
      content: {
        [CONTENT_TYPE.FORM_URLENCODED]: {
          schema: getModelSchemaRef(ClientAuthRequest),
        },
      },
    })
    clientCreds?: ClientAuthRequest, //NOSONAR
  ): Promise<void> {
    //do nothing
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(
    STRATEGY.KEYCLOAK,
    {
      host: process.env.KEYCLOAK_HOST,
      realm: process.env.KEYCLOAK_REALM, //'Tenant1',
      clientID: process.env.KEYCLOAK_CLIENT_ID, //'onboarding',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      //'e607fd75-adc8-4af7-9f03-c9e79a4b8b72',
      callbackURL: process.env.KEYCLOAK_CALLBACK_URL,
      //'http://localhost:3001/auth/keycloak-auth-redirect',
      authorizationURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      tokenURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      userInfoURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
    },
    queryGen('query'),
  )
  @oas.deprecated()
  @get('/auth/keycloak', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Keycloak Token Response',
        // (Deprecated: Possible security issue
        //if secret is passed via query params, please use the post endpoint)
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async loginViaKeycloak(
    @param.query.string('client_id')
    clientId?: string, //NOSONAR
    @param.query.string('client_secret')
    clientSecret?: string, //NOSONAR
  ): Promise<void> {
    //do nothing
  }

  @authenticate(
    STRATEGY.KEYCLOAK,
    {
      host: process.env.KEYCLOAK_HOST,
      realm: process.env.KEYCLOAK_REALM, //'Tenant1',
      clientID: process.env.KEYCLOAK_CLIENT_ID, //'onboarding',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      //'e607fd75-adc8-4af7-9f03-c9e79a4b8b72',
      callbackURL: process.env.KEYCLOAK_CALLBACK_URL,
      //'http://localhost:3001/auth/keycloak-auth-redirect',
      authorizationURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      tokenURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      userInfoURL: `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
    },
    queryGen('query'),
  )
  @get('/auth/keycloak-auth-redirect', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Keycloak Redirect Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
    },
  })
  async keycloakCallback(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
    @param.query.string('response_mode') responseMode: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<void> {
    const stateParams = new URLSearchParams(state);
    const clientId = stateParams.get('client_id');
    const clientState = stateParams.get('state');
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
        return this.authPages.webMessage({code: token, state: clientState}, response);
      }
      response.redirect(`${client.redirectUrl}?${toQueryString({code: token, state: clientState})}`);
    } catch (error) {
      this.logger.error(error);
      throw new AuthenticationErrors.InvalidCredentials();
    }
  }
}
