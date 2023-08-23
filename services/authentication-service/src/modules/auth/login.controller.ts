import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  ClientAuthCode,
  STRATEGY,
} from '@bleco/authentication';
import {AuthorizationErrors, authorize} from '@bleco/authorization';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {getModelSchemaRef, param, patch, post, Request, requestBody, RestBindings} from '@loopback/rest';
import {
  AuthErrors,
  CONTENT_TYPE,
  ErrorCodes,
  IAuthUserWithPermissions,
  ILogger,
  LOGGER,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
  SuccessResponse,
  UserStatus,
  X_TS_TYPE,
} from '@loopx/core';
import {BErrors} from 'berrors';

import {LoginType} from '../../enums';
import {AuthServiceBindings} from '../../keys';
import {AuthClient, User} from '../../models';
import {AuthCodeBindings, AuthCodeGeneratorFn, JwtPayloadFn, JWTSignerFn} from '../../providers';
import {
  AuthClientRepository,
  OtpCacheRepository,
  RefreshTokenRepository,
  RevokedTokenRepository,
  RoleRepository,
  TenantConfigRepository,
  UserCredentialsRepository,
  UserLevelPermissionRepository,
  UserRepository,
  UserTenantRepository,
} from '../../repositories';
import {LoginHelperService, TokenService} from '../../services';
import {CodeResponse, LoginCodeResponse, LoginRequest} from './';
import {AuthUser} from './models/auth-user.model';
import {ResetPassword} from './models/reset-password.dto';
import {TokenResponse} from './models/token-response.dto';

export class LoginController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    private readonly client: AuthClient | undefined,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly user: AuthUser | undefined,
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @repository(UserRepository)
    public userRepo: UserRepository,
    @repository(OtpCacheRepository)
    public otpCacheRepo: OtpCacheRepository,
    @repository(RoleRepository)
    public roleRepo: RoleRepository,
    @repository(UserLevelPermissionRepository)
    public utPermsRepo: UserLevelPermissionRepository,
    @repository(UserTenantRepository)
    public userTenantRepo: UserTenantRepository,
    @repository(RefreshTokenRepository)
    public refreshTokenRepo: RefreshTokenRepository,
    @repository(RevokedTokenRepository)
    public revokedTokensRepo: RevokedTokenRepository,
    @repository(TenantConfigRepository)
    public tenantConfigRepo: TenantConfigRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(RestBindings.Http.REQUEST)
    private readonly req: Request,
    @inject(AuthServiceBindings.JWTPayloadProvider)
    private readonly getJwtPayload: JwtPayloadFn,
    @service(LoginHelperService)
    private readonly loginHelperService: LoginHelperService,
    @service(TokenService)
    private readonly tokenService: TokenService,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
    @inject(AuthCodeBindings.JWT_SIGNER)
    private readonly jwtSigner: JWTSignerFn<object>,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.LOCAL)
  @authorize({permissions: ['*']})
  @post('/auth/login', {
    description: 'Gets you the code that will be used for getting token (webapps)',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Auth Code that you can use to generate access and refresh tokens using the POST /auth/token API',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(LoginCodeResponse),
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async login(
    @requestBody()
    req: LoginRequest,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    client: AuthClient | undefined,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
  ): Promise<CodeResponse> {
    await this.loginHelperService.verifyClientUserLogin(req, client, user);

    try {
      if (!this.user || !this.client) {
        // Control should never reach here
        this.logger.error(`${AuthenticationErrors.ClientInvalid.name} :: Control should never reach here`);
        throw new AuthenticationErrors.ClientInvalid();
      }
      const token = await this.getAuthCode(this.client, this.user);
      return {
        code: token,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new AuthenticationErrors.InvalidCredentials();
    }
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.OAUTH2_RESOURCE_OWNER_GRANT)
  @authorize({permissions: ['*']})
  @post('/auth/login-token', {
    description: 'Gets you refresh token and access token in one hit. (mobile app)',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Token Response Model',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {[X_TS_TYPE]: TokenResponse},
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async loginWithClientUser(@requestBody() req: LoginRequest): Promise<TokenResponse> {
    await this.loginHelperService.verifyClientUserLogin(req, this.client, this.user);

    try {
      if (!this.user || !this.client) {
        // Control should never reach here
        this.logger.error(`${AuthenticationErrors.ClientInvalid.name} :: Control should never reach here`);
        throw new AuthenticationErrors.ClientInvalid();
      }
      const payload: ClientAuthCode<User, typeof User.prototype.id> = {
        clientId: this.client.clientId,
        user: this.user,
      };

      if (payload.user?.id && !(await this.userRepo.firstTimeUser(payload.user.id))) {
        await this.userRepo.updateLastLogin(payload.user.id);
      }

      return await this.tokenService.createJWT(payload, this.client, LoginType.ACCESS);
    } catch (error) {
      this.logger.error(error);
      throw new AuthenticationErrors.InvalidCredentials();
    }
  }

  @authenticate(STRATEGY.BEARER, {passReqToCallback: true})
  @authorize({permissions: ['*']})
  @patch(`auth/change-password`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'If User password successfully changed.',
      },
    },
  })
  async changePassword(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(ResetPassword, {partial: true}),
        },
      },
    })
    req: ResetPassword,
    @param.header.string('Authorization') auth: string,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: IAuthUserWithPermissions,
  ): Promise<SuccessResponse> {
    const token = auth?.replace(/bearer /i, '');
    if (!token || !req.refreshToken) {
      throw new AuthErrors.TokenMissing();
    }

    const refreshTokenModel = await this.refreshTokenRepo.get(req.refreshToken);
    if (refreshTokenModel.accessToken !== token) {
      throw new AuthenticationErrors.TokenInvalid();
    }
    if (refreshTokenModel.username !== req.username || currentUser.username !== req.username) {
      throw new AuthorizationErrors.NotAllowedAccess();
    }

    if (req.password && req.password.length <= 0) {
      throw new AuthErrors.PasswordInvalid();
    }

    let changePasswordResponse: User;
    if (req.oldPassword) {
      changePasswordResponse = await this.userRepo.updatePassword(req.username, req.oldPassword, req.password);
    } else {
      changePasswordResponse = await this.userRepo.changePassword(req.username, req.password);
    }

    if (!changePasswordResponse) {
      throw new BErrors.UnprocessableEntity('Unable to set password !');
    }

    const userTenant = await this.userTenantRepo.findOne({
      where: {
        userId: changePasswordResponse.id,
        tenantId: currentUser.tenantId,
      },
    });
    if (!userTenant) {
      throw new AuthErrors.UserInactive();
    }

    if (userTenant.status && userTenant.status < UserStatus.ACTIVE) {
      await this.userRepo.userTenants(changePasswordResponse.id).patch({
        status: UserStatus.ACTIVE,
      });
    }
    await this.revokedTokensRepo.set(token, {token});
    await this.refreshTokenRepo.delete(req.refreshToken);
    return new SuccessResponse({
      success: true,
    });
  }
}
