import * as jwt from 'jsonwebtoken';

import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';

import {
  AuthenticationBindings,
  ClientAuthCode,
  STRATEGY,
  authenticate,
  authenticateClient,
} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';

import {CONTENT_TYPE, ErrorCodes, ILogger, LOGGER, STATUS_CODE} from '@loopx/core';

import {User} from '../../models';
import {AuthCodeBindings, CodeWriterFn, VerifyBindings} from '../../providers';
import {AuthClientRepository, OtpCacheRepository, UserCredentialsRepository, UserRepository} from '../../repositories';
import {CodeResponse, OtpLoginRequest} from './';
import {AuthUser} from './models/auth-user.model';
import {OtpSendRequest} from './models/otp-send-request.dto';

const basePath = '/auth/passwordless';

export class PasswordlessController {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
    @repository(UserRepository)
    public userRepo: UserRepository,
    @repository(OtpCacheRepository)
    public otpCacheRepo: OtpCacheRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
  ) {}

  // OTP
  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authenticate(STRATEGY.OTP, {}, undefined, VerifyBindings.PASSWORDLESS_VERIFIER)
  @authorize({permissions: ['*']})
  @post(`${basePath}/start`, {
    description: 'Sends OTP',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Sends otp to user',
        content: {
          [CONTENT_TYPE.JSON]: Object,
        },
      },
      ...ErrorCodes,
    },
  })
  async startPasswordless(
    @requestBody()
    req: OtpSendRequest,
  ): Promise<void> {
    // This is intentional
  }

  @authenticate(STRATEGY.OTP, {}, undefined, VerifyBindings.PASSWORDLESS_VERIFIER)
  @authorize({permissions: ['*']})
  @post(`${basePath}/verify`, {
    description: 'Gets you the code that will be used for getting token (webapps)',
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Auth Code that you can use to generate access and refresh tokens using the POST /auth/token API',
        content: {
          [CONTENT_TYPE.JSON]: Object,
        },
      },
      ...ErrorCodes,
    },
  })
  async verifyPasswordless(
    @requestBody()
    req: OtpLoginRequest,
    @inject(AuthenticationBindings.CURRENT_USER)
    user: AuthUser | undefined,
    @inject(AuthCodeBindings.CODEWRITER_PROVIDER)
    codeWriter: CodeWriterFn,
  ): Promise<CodeResponse> {
    const otpCache = await this.otpCacheRepo.get(req.key);
    if (user?.id) {
      otpCache.userId = user.id;
    }
    const codePayload: ClientAuthCode<User, typeof User.prototype.id> = {
      clientId: otpCache.clientId,
      userId: otpCache.userId,
    };
    const token = await codeWriter(
      jwt.sign(codePayload, otpCache.clientSecret, {
        expiresIn: 180,
        audience: otpCache.clientId,
        issuer: process.env.JWT_ISSUER,
        algorithm: 'HS256',
      }),
    );
    return {
      code: token,
    };
  }
}
