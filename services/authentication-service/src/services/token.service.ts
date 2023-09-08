import {AuthenticationErrors} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {BindingScope, injectable} from '@loopback/core';
import {AnyObject, repository} from '@loopback/repository';
import {RequestContext} from '@loopback/rest';
import {AuthErrors, ILogger, LOGGER} from '@loopx/core';
import {AuthClient, User, UserRepository, UserTenant, UserTenantRepository} from '@loopx/user-core';
import {BErrors} from 'berrors';
import crypto, {randomBytes} from 'crypto';
import moment from 'moment-timezone';

import {LoginType} from '../enums';
import {AuthServiceBindings} from '../keys';
import {LoginActivity} from '../models';
import {AuthUser, TokenResponse} from '../modules/auth';
import {AuthCodeBindings, JwtPayloadFn, JWTSignerFn} from '../providers';
import {LoginActivityRepository, RefreshTokenRepository} from '../repositories';
import {ActorId, ExternalTokens, IUserActivity} from '../types';

const REFRESH_TOKENS_IZE = 32;
const MS_IN_SECOND = 1000;

interface UserAware {
  userId?: string;
  user?: User;
}

@injectable({scope: BindingScope.SINGLETON})
export class TokenService {
  constructor(
    @inject.context() private readonly ctx: RequestContext,
    @repository(UserRepository)
    private readonly userRepo: UserRepository,
    @repository(UserTenantRepository)
    private readonly userTenantRepo: UserTenantRepository,
    @repository(RefreshTokenRepository)
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @inject(AuthServiceBindings.JWTPayloadProvider)
    private readonly getJwtPayload: JwtPayloadFn,
    @inject(AuthCodeBindings.JWT_SIGNER)
    private readonly jwtSigner: JWTSignerFn<object>,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @repository(LoginActivityRepository)
    private readonly loginActivityRepo: LoginActivityRepository,
    @inject(AuthServiceBindings.ActorIdKey)
    private readonly actorKey: ActorId,
    @inject(AuthServiceBindings.MarkUserActivity, {optional: true})
    private readonly userActivity?: IUserActivity,
  ) {}

  async createJWT(
    payload: UserAware & ExternalTokens,
    authClient: AuthClient,
    loginType: LoginType,
    tenantId?: string,
  ): Promise<TokenResponse> {
    try {
      let user: User | undefined;
      if (payload.user) {
        user = payload.user;
      } else if (payload.userId) {
        user = await this.userRepo.findById(payload.userId, {
          include: [
            {
              relation: 'defaultTenant',
            },
          ],
        });
        if (payload.externalAuthToken && payload.externalRefreshToken) {
          (user as AuthUser).externalAuthToken = payload.externalAuthToken;
          (user as AuthUser).externalRefreshToken = payload.externalRefreshToken;
        }
      } else {
        // Do nothing and move ahead
      }
      if (!user) {
        throw new AuthErrors.UserDoesNotExist();
      }
      const data: AnyObject = await this.getJwtPayload(user, authClient, tenantId);
      const accessToken = await this.jwtSigner(data, {
        expiresIn: authClient.accessTokenExpiration,
      });
      const refreshToken: string = randomBytes(REFRESH_TOKENS_IZE).toString('hex');
      // Set refresh token into redis for later verification
      await this.refreshTokenRepo.set(
        refreshToken,
        {
          clientId: authClient.clientId,
          userId: user.id,
          username: user.username,
          accessToken,
          externalAuthToken: (user as AuthUser).externalAuthToken,
          externalRefreshToken: (user as AuthUser).externalRefreshToken,
          tenantId: data.tenantId,
        },
        {ttl: authClient.refreshTokenExpiration * MS_IN_SECOND},
      );
      const userTenant = await this.userTenantRepo.findOne({
        where: {userId: user.id},
      });
      if (this.userActivity?.markUserActivity) this.markUserActivity(user, userTenant, {...data}, loginType);

      return new TokenResponse({
        accessToken,
        refreshToken,
        expiresIn: authClient.accessTokenExpiration,
        expiresAt: Math.floor(moment().add(authClient.accessTokenExpiration, 's').toDate().getTime() / 1000),
      });
    } catch (error) {
      this.logger.error(error);
      if (BErrors.Error.prototype.isPrototypeOf.call(BErrors.Error.prototype, error)) {
        throw error;
      } else {
        throw new AuthenticationErrors.InvalidCredentials();
      }
    }
  }

  private markUserActivity(user: User, userTenant: UserTenant | null, payload: AnyObject, loginType: LoginType) {
    const size = 16;
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

      /* encryption of Payload Address */
      const cipherPayload = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
      const activityPayload = JSON.stringify(payload);
      const encryptPayload = Buffer.concat([cipherPayload.update(activityPayload, 'utf8'), cipherPayload.final()]);
      const authTagPayload = cipherIp.getAuthTag();
      const tokenPayload = JSON.stringify({
        iv: iv.toString('hex'),
        encryptedData: encryptPayload.toString('hex'),
        authTag: authTagPayload.toString('hex'),
      });
      // make an entry to mark the users login activity
      let actor;
      let tenantId;
      if (userTenant) {
        actor = userTenant[this.actorKey]?.toString() ?? '0';
        tenantId = userTenant.tenantId;
      } else {
        actor = user['id']?.toString() ?? '0';
        tenantId = user.defaultTenantId;
      }
      const loginActivity = new LoginActivity({
        actor,
        tenantId,
        loginTime: new Date(),
        tokenPayload,
        loginType,
        deviceInfo: this.ctx.request.headers['user-agent']?.toString(),
        ipAddress,
      });
      this.loginActivityRepo.create(loginActivity).catch(() => {
        this.logger.error(`Failed to add the login activity => ${JSON.stringify(loginActivity)}`);
      });
    }
  }
}
