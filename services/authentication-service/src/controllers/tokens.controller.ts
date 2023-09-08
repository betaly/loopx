import {
  authenticate,
  AuthenticationBindings,
  AuthenticationErrors,
  ClientAuthCode,
  STRATEGY,
} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {AnyObject, repository} from '@loopback/repository';
import {get, post, requestBody} from '@loopback/rest';
import {CONTENT_TYPE, ErrorCodes, ILogger, LOGGER, OPERATION_SECURITY_SPEC, STATUS_CODE, X_TS_TYPE} from '@loopx/core';
import {AuthClientRepository, User, UserRepository} from '@loopx/user-core';
import {BErrors} from 'berrors';
import * as jwt from 'jsonwebtoken';

import {LoginType} from '../enums';
import {RefreshToken} from '../models';
import {AuthRefreshTokenRequest, AuthTokenRequest, AuthUser, TokenResponse} from '../modules/auth';
import {AuthCodeBindings, CodeReaderFn} from '../providers';
import {RefreshTokenRepository, RevokedTokenRepository} from '../repositories';
import {TokenService} from '../services';

export class TokensController {
  constructor(
    @repository(AuthClientRepository)
    private readonly authClientRepo: AuthClientRepository,
    @repository(UserRepository)
    private readonly userRepo: UserRepository,
    @repository(RefreshTokenRepository)
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @repository(RevokedTokenRepository)
    private readonly revokedTokenRepo: RevokedTokenRepository,
    @service(TokenService)
    private readonly tokenService: TokenService,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly user: AuthUser | undefined,
  ) {}

  @post('/auth/token', {
    description:
      'Send the code received from the POST /auth/login api and get refresh token and access token (webapps)',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async getToken(
    @requestBody() req: AuthTokenRequest,
    @inject(AuthCodeBindings.CODEREADER_PROVIDER)
    codeReader: CodeReaderFn,
  ): Promise<TokenResponse> {
    const authClient = await this.authClientRepo.findOne({
      where: {
        clientId: req.clientId,
      },
    });
    if (!authClient) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    try {
      const code = await codeReader(req.code);
      const payload = jwt.verify(code, authClient.secret, {
        audience: req.clientId,
        issuer: process.env.JWT_ISSUER,
        algorithms: ['HS256'],
      }) as ClientAuthCode<User, typeof User.prototype.id>;

      if (payload.mfa) {
        throw new AuthenticationErrors.UserVerificationFailed();
      }

      if (payload.userId && !(await this.userRepo.firstTimeUser(payload.userId))) {
        await this.userRepo.updateLastLogin(payload.userId);
      }

      return await this.tokenService.createJWT(payload, authClient, LoginType.ACCESS);
    } catch (error) {
      this.logger.error(error);
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationErrors.CodeExpired();
      } else if (BErrors.Error.prototype.isPrototypeOf.call(BErrors.Error.prototype, error)) {
        throw error;
      } else {
        throw new AuthenticationErrors.InvalidCredentials();
      }
    }
  }

  @post('/auth/token-refresh', {
    description: 'Gets you a new access and refresh token once your access token is expired',
    //(both mobile and web)
    responses: {
      [STATUS_CODE.OK]: {
        description: 'New Token Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async exchangeToken(@requestBody() req: AuthRefreshTokenRequest): Promise<TokenResponse> {
    const payload = await this.createTokenPayload(req);
    return this.tokenService.createJWT(
      {
        userId: payload.refreshPayload.userId,
        externalAuthToken: payload.refreshPayload.externalAuthToken,
        externalRefreshToken: payload.refreshPayload.externalRefreshToken,
      },
      payload.authClient,
      LoginType.RELOGIN,
      payload.refreshPayload.tenantId,
    );
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @post('/auth/token-switch', {
    security: OPERATION_SECURITY_SPEC,
    description: 'To switch the access-token',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Switch access token with the tenant id provided.',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async switchToken(@requestBody() req: AuthRefreshTokenRequest): Promise<TokenResponse> {
    if (!req.tenantId) {
      throw new BErrors.BadRequest('Tenant ID is required');
    }
    if (!this.user) {
      throw new AuthenticationErrors.TokenInvalid();
    }

    const payload = await this.createTokenPayload(req);
    return this.tokenService.createJWT(
      {
        user: this.user,
        externalAuthToken: payload.refreshPayload.externalAuthToken,
        externalRefreshToken: payload.refreshPayload.externalRefreshToken,
      },
      payload.authClient,
      LoginType.RELOGIN,
      req.tenantId,
    );
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @get('/auth/me', {
    security: OPERATION_SECURITY_SPEC,
    description: 'To get the user details',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User Object',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: AuthUser},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async me(): Promise<AuthUser | undefined> {
    if (!this.user) {
      throw new AuthenticationErrors.TokenInvalid();
    }
    delete this.user.deviceInfo;
    return new AuthUser(this.user);
  }

  private async createTokenPayload(req: AuthRefreshTokenRequest /*, token?: string */): Promise<AnyObject> {
    const refreshPayload: RefreshToken = await this.refreshTokenRepo.get(req.refreshToken);
    if (!refreshPayload) {
      throw new AuthenticationErrors.TokenExpired();
    }
    const authClient = await this.authClientRepo.findOne({
      where: {
        clientId: refreshPayload.clientId,
      },
    });
    if (!authClient) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    // const accessToken = token?.split(' ')[1];
    // if (!accessToken || refreshPayload.accessToken !== accessToken) {
    //   throw new AuthenticationErrors.TokenInvalid();
    // }
    await this.revokedTokenRepo.set(refreshPayload.accessToken, {
      token: refreshPayload.accessToken,
    });
    await this.refreshTokenRepo.delete(req.refreshToken);
    return {
      refreshPayload,
      authClient,
    };
  }
}
