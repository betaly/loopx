import {authenticate, AuthenticationBindings, AuthenticationErrors, IAuthUser, STRATEGY} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, post, requestBody, RequestContext, Response, RestBindings} from '@loopback/rest';
import {
  AuthErrors,
  CONTENT_TYPE,
  ErrorCodes,
  ILogger,
  LOGGER,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
  SuccessResponse,
  X_TS_TYPE,
} from '@loopx/core';
import {AuthClientRepository, User, UserRepository, UserTenant, UserTenantRepository} from '@loopx/user-core';
import crypto from 'crypto';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {URLSearchParams} from 'url';
import UrlSafer from 'urlsafer';

import {LoginType} from '../../enums';
import {AuthServiceBindings} from '../../keys';
import {LoginActivity, RefreshToken, RefreshTokenRequest} from '../../models';
import {LoginActivityRepository, RefreshTokenRepository, RevokedTokenRepository} from '../../repositories';
import {ActorId, IUserActivity} from '../../types';
import {buildLogoutBindingKey} from './keys';
import {AuthLogoutFn} from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LogoutSessionKey = 'logout';

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getProxyAgent = () => {
  if (proxyUrl) {
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
};

const size = 16;

export class LogoutController {
  constructor(
    @inject.context()
    private readonly ctx: RequestContext,
    @inject(RestBindings.Http.RESPONSE)
    private readonly res: Response,
    @repository(RevokedTokenRepository)
    private readonly revokedTokens: RevokedTokenRepository,
    @repository(RefreshTokenRepository)
    public refreshTokenRepo: RefreshTokenRepository,
    @repository(UserRepository)
    public userRepo: UserRepository,
    @repository(AuthClientRepository)
    public authClientRepo: AuthClientRepository,
    @inject(LOGGER.LOGGER_INJECT)
    public logger: ILogger,
    @inject(AuthServiceBindings.ActorIdKey)
    private readonly actorKey: ActorId,
    @repository(UserTenantRepository)
    public userTenantRepo: UserTenantRepository,
    @repository(LoginActivityRepository)
    private readonly loginActivityRepo: LoginActivityRepository,
    @inject(AuthServiceBindings.MarkUserActivity, {optional: true})
    private readonly userActivity?: IUserActivity,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @post('/logout', {
    security: OPERATION_SECURITY_SPEC,
    description: 'To logout',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Success Response',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: SuccessResponse},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async logout(
    @param.header.string('Authorization', {
      description: 'This is the access token which is required to authenticate user.',
    })
    auth: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(RefreshTokenRequest, {
            partial: true,
          }),
        },
      },
    })
    req: RefreshTokenRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUser,
  ): Promise<SuccessResponse> {
    const token = auth?.replace(/bearer /i, '');
    if (!token || !req.refreshToken) {
      throw new AuthErrors.TokenMissing();
    }

    const refreshTokenModel = await this.refreshTokenRepo.get(req.refreshToken);
    if (!refreshTokenModel) {
      throw new AuthenticationErrors.TokenExpired();
    }

    let logoutUrl;
    if (refreshTokenModel.externalRefreshToken) {
      const creds = await this.userRepo.credentials(refreshTokenModel.userId).get();
      try {
        const logoutFn = await this.ctx.get<AuthLogoutFn>(buildLogoutBindingKey(creds.authProvider), {
          optional: true,
        });
        logoutUrl = await logoutFn?.(
          refreshTokenModel.externalRefreshToken,
          // `client_id=${refreshTokenModel.clientId}`,
          UrlSafer.encode(`client_id=${refreshTokenModel.clientId}`),
        );
        this.logger.info(
          `User ${refreshTokenModel.username} logged off successfully from ${
            creds.authProvider
          } and return logout url ${logoutUrl ?? '<empty>'}`,
        );
      } catch (e) {
        this.logger.error(`Error while logging off from ${creds.authProvider}. Error :: ${e} ${JSON.stringify(e)}`);
      }
    }

    if (refreshTokenModel.accessToken !== token) {
      throw new AuthenticationErrors.TokenInvalid();
    }
    await this.revokedTokens.set(token, {token});
    await this.refreshTokenRepo.delete(req.refreshToken);
    if (refreshTokenModel.pubnubToken) {
      await this.refreshTokenRepo.delete(refreshTokenModel.pubnubToken);
    }

    const user = await this.userRepo.findById(refreshTokenModel.userId);

    const userTenant = await this.userTenantRepo.findOne({
      where: {userId: user.id},
    });

    if (this.userActivity?.markUserActivity) {
      this.markUserActivity(refreshTokenModel, user, userTenant);
    }

    return new SuccessResponse({
      success: true,
      key: refreshTokenModel.userId,
      logoutUrl,
    });
  }

  @get('/logout/redirect')
  async logoutRedirect(
    @param.query.string('state')
    state: string,
  ) {
    const clientId = new URLSearchParams(UrlSafer.decode(state)).get('client_id');
    if (!clientId) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    const authClient = await this.authClientRepo.findOne({where: {clientId}});
    if (!authClient) {
      throw new AuthenticationErrors.ClientInvalid();
    }
    if (!authClient.logoutRedirectUrl) {
      throw new AuthenticationErrors.ClientInvalid('logout_redirect_url is not configured');
    }
    this.res.redirect(authClient.logoutRedirectUrl);
  }

  private markUserActivity(refreshTokenModel: RefreshToken, user: User, userTenant: UserTenant | null) {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (encryptionKey) {
      const iv = crypto.randomBytes(size);

      /* encryption of IP Address */
      const cipherIp = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
      const ip =
        this.ctx.request.headers['x-forwarded-for']?.toString() ??
        this.ctx.request.socket.remoteAddress?.toString() ??
        '';
      const encryptIp = Buffer.concat([cipherIp.update(ip, 'utf8'), cipherIp.final()]);
      const authTagIp = cipherIp.getAuthTag();
      const ipAddress = JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encryptIp.toString('hex'),
        authTag: authTagIp.toString('hex'),
      });

      /* encryption of Paylolad Address */

      const cipherPayload = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
      const activityPayload = JSON.stringify({
        ...user,
        clientId: refreshTokenModel.clientId,
      });
      const encryptPayload = Buffer.concat([cipherPayload.update(activityPayload, 'utf8'), cipherPayload.final()]);
      const authTagPayload = cipherIp.getAuthTag();
      const tokenPayload = JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encryptPayload.toString('hex'),
        authTag: authTagPayload.toString('hex'),
      });
      let actor: string, tenantId;
      if (userTenant) {
        actor = userTenant[this.actorKey]?.toString() ?? '0';
        tenantId = userTenant.tenantId;
      } else {
        actor = user['id']?.toString() ?? '0';
        tenantId = user.defaultTenantId ?? '0';
      }

      const loginActivity = new LoginActivity({
        actor,
        tenantId,
        loginTime: new Date(),
        tokenPayload,
        deviceInfo: this.ctx.request.headers['user-agent']?.toString(),
        loginType: LoginType.LOGOUT,
        ipAddress,
      });
      this.loginActivityRepo.create(loginActivity).catch(() => {
        this.logger.error(loginActivity, 'Failed to add the login activity');
      });
    }
  }
}
