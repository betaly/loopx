﻿import {
  authenticateClient,
  AuthenticationBindings,
  AuthenticationErrors,
  ClientAuthCode,
  STRATEGY,
} from '@bleco/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, patch, post, requestBody} from '@loopback/rest';
import {
  AuthErrors,
  AuthProvider,
  ErrorCodes,
  ILogger,
  LOGGER,
  OPERATION_SECURITY_SPEC,
  STATUS_CODE,
  SuccessResponse,
} from '@loopx/core';
import {AuthClient, User, UserRepository} from '@loopx/user-core';
import * as jwt from 'jsonwebtoken';
import {omit} from 'lodash';

import {AuthServiceBindings} from '../keys';
import {ForgetPasswordDto, ResetPasswordWithClient} from '../models';
import {ForgotPasswordHandlerFn} from '../providers';
import {RevokedTokenRepository} from '../repositories';
import {LoginHelperService, UserAuthService} from '../services';

export class ForgetPasswordController {
  constructor(
    @repository(UserRepository)
    private readonly userRepo: UserRepository,
    @repository(RevokedTokenRepository)
    private readonly revokedTokensRepo: RevokedTokenRepository,
    @service(UserAuthService)
    private readonly userAuthService: UserAuthService,
    @service(LoginHelperService)
    private readonly loginHelperService: LoginHelperService,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @post(`auth/forget-password`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: 'Success Response.',
      },
      ...ErrorCodes,
    },
  })
  async forgetPassword(
    @requestBody()
    req: ForgetPasswordDto,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    client: AuthClient,
    @inject(AuthServiceBindings.ForgotPasswordHandler)
    forgetPasswordHandler: ForgotPasswordHandlerFn,
  ): Promise<void> {
    const user = await this.userRepo.findOne({
      where: {
        username: req.username,
      },
      include: ['credentials'],
    });
    try {
      await this.loginHelperService.verifyClientUserLogin(req, client, user);
    } catch (e) {
      return;
    }
    if (!user?.id) {
      this.logger.info(`Forget password attempted for invalid user`);
      return;
    }

    if (!user.email) {
      this.logger.info(`Forget password attempted for user without email`);
      return;
    }

    const codePayload: ClientAuthCode<User> = {
      clientId: client.clientId,
      userId: parseInt(user.id),
      user: new User({
        id: user.id,
        email: user.email,
        username: user.username,
      }),
    };
    // Default expiry is 30 minutes
    const expiryDuration = parseInt(process.env.FORGOT_PASSWORD_LINK_EXPIRY ?? '1800');
    const token = jwt.sign(codePayload, process.env.JWT_SECRET as string, {
      expiresIn: expiryDuration,
      audience: req.client_id,
      subject: user.username.toLowerCase(),
      issuer: process.env.JWT_ISSUER,
      algorithm: 'HS256',
    });

    if (user?.credentials?.authProvider !== AuthProvider.INTERNAL) {
      throw new AuthErrors.PasswordCannotBeChanged();
    }

    await forgetPasswordHandler({
      code: token,
      expiry: expiryDuration,
      email: user.email,
      user: omit(user, 'credentials'),
    });
  }

  @get(`auth/verify-reset-password-link`, {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Check if Token Is Valid and not Expired.',
      },
    },
  })
  async verifyResetPasswordLink(
    @param.query.string('token', {required: true})
    token: string,
  ): Promise<SuccessResponse> {
    let payload;

    const isRevoked = await this.revokedTokensRepo.get(token);
    if (isRevoked?.token) {
      throw new AuthErrors.TokenRevoked();
    }
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
        algorithms: ['HS256'],
      }) as ClientAuthCode<User>;
    } catch (error) {
      throw new AuthenticationErrors.TokenExpired();
    }

    if (!payload.clientId || !payload.user) {
      throw new AuthenticationErrors.TokenInvalid();
    }

    return new SuccessResponse({
      success: true,
    });
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @patch(`auth/reset-password`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: 'If User password successfully changed.',
      },
    },
  })
  async resetPassword(
    @requestBody()
    req: ResetPasswordWithClient,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    client: AuthClient,
  ): Promise<void> {
    if (!req.token) {
      throw new AuthErrors.TokenMissing();
    }

    if (req.password && req.password.length <= 0) {
      throw new AuthErrors.PasswordInvalid();
    }

    let payload: ClientAuthCode<User>;

    const isRevoked = await this.revokedTokensRepo.get(req.token);
    if (isRevoked?.token) {
      throw new AuthErrors.TokenRevoked();
    }

    try {
      payload = jwt.verify(req.token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
        algorithms: ['HS256'],
      }) as ClientAuthCode<User>;
    } catch (error) {
      throw new AuthenticationErrors.TokenExpired();
    }

    if (!payload.clientId || !payload.user) {
      throw new AuthenticationErrors.TokenInvalid();
    }
    const user = await this.userRepo.findOne({
      where: {
        username: payload.user.username,
      },
    });
    await this.loginHelperService.verifyClientUserLogin(req, client, user);

    await this.userAuthService.changePassword(payload.user.username, req.password);

    await this.revokedTokensRepo.set(req.token, {
      token: req.token,
    });
  }
}
