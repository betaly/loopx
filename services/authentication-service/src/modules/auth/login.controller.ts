import {
  authenticate,
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  ClientAuthCode,
  STRATEGY,
} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {getModelSchemaRef, param, patch, post, requestBody} from '@loopback/rest';
import {
  AuthErrors,
  CONTENT_TYPE,
  ErrorCodes,
  IAuthTenantUser,
  ILogger,
  LOGGER,
  OPERATION_SECURITY_SPEC,
  RevokedTokenRepository,
  STATUS_CODE,
  SuccessResponse,
  UserStatus,
  X_TS_TYPE,
} from '@loopx/core';
import {
  AuthClient,
  AuthClientRepository,
  RoleRepository,
  TenantConfigRepository,
  User,
  UserCredentialsRepository,
  UserLevelPermissionRepository,
  UserRepository,
  UserTenantRepository,
} from '@loopx/user-core';
import {BErrors} from 'berrors';
import {AclErrors} from 'loopback4-acl';

import {LoginType} from '../../enums';
import {AuthCodeBindings, AuthCodeGeneratorFn} from '../../providers';
import {OtpCacheRepository, RefreshTokenRepository} from '../../repositories';
import {LoginHelperService, TokenService, UserAuthService} from '../../services';
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
    @service(LoginHelperService)
    private readonly loginHelperService: LoginHelperService,
    @service(TokenService)
    private readonly tokenService: TokenService,
    @service(UserAuthService)
    private readonly userAuthService: UserAuthService,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.LOCAL)
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
    currentUser: IAuthTenantUser,
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
      throw new AclErrors.NotAllowedAccess();
    }

    if (req.password && req.password.length <= 0) {
      throw new AuthErrors.PasswordInvalid();
    }

    let changePasswordResponse: User;
    if (req.oldPassword) {
      changePasswordResponse = await this.getPasswordResponse(req.username, req.password, req.oldPassword);
    } else {
      changePasswordResponse = await this.getPasswordResponse(req.username, req.password);
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

  async getPasswordResponse(userName: string, password: string, prevPassword?: string): Promise<User> {
    // TODO implement password decryption ?
    if (prevPassword) {
      const oldPassword = prevPassword;
      const newPassword = password;
      // if (process.env.PRIVATE_DECRYPTION_KEY) {
      //   oldPassword = await this.userRepo.decryptPassword(oldPassword);
      //   newPassword = await this.userRepo.decryptPassword(password);
      // }
      return this.userRepo.updatePassword(userName, oldPassword, newPassword);
    } else {
      const newPassword = password;
      // if (process.env.PRIVATE_DECRYPTION_KEY) {
      //   newPassword = await this.userRepo.decryptPassword(password);
      // }
      return this.userAuthService.changePassword(userName, newPassword);
    }
  }
}
