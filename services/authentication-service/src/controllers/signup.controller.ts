// Uncomment these imports to begin using these cool features!
import * as jwt from 'jsonwebtoken';

import {inject, service} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import {get, getModelSchemaRef, post, requestBody} from '@loopback/rest';

import {AuthenticationBindings, STRATEGY, authenticate, authenticateClient} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';

import {CONTENT_TYPE, ErrorCodes, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';

import {AuthClient, LocalUserEmailPasswordProfile, LocalUserProfile, User} from '../models';
import {LocalUserEmailPasswordProfileDto} from '../models/local-user-profile';
import {SignupFastRequestDto} from '../models/signup-fast-request.dto.model';
import {SignupRequestDto} from '../models/signup-request-dto.model';
import {SignupRequest} from '../models/signup-request.model';
import {SignupWithTokenResponseDto} from '../models/signup-with-token-response-dto.model';
import {AuthUser} from '../modules/auth';
import {
  AuthCodeBindings,
  AuthCodeGeneratorFn,
  SignUpBindings,
  SignupTokenHandlerFn,
  VerifyBindings,
} from '../providers';
import {SignupHelperService, TokenService} from '../services';
import {PreSignupFn, UserSignupFn} from '../types';

const successResponse = 'Success Response.';
const basePath = '/auth/signup';

export class SignupController {
  constructor(
    @inject(SignUpBindings.PRE_LOCAL_SIGNUP_PROVIDER)
    private readonly preSignupFn: PreSignupFn<LocalUserEmailPasswordProfile, SignupRequest>,
    @inject(SignUpBindings.LOCAL_SIGNUP_PROVIDER)
    private readonly userSignupFn: UserSignupFn<LocalUserProfile, User>,
    @service(SignupHelperService)
    private readonly signupHelperService: SignupHelperService,
    @service(TokenService)
    private readonly tokenService: TokenService,
    @inject(AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER)
    private readonly getAuthCode: AuthCodeGeneratorFn,
  ) {}

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authorize({permissions: ['*']})
  @post(`${basePath}/fast`, {
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: successResponse,
      },
      ...ErrorCodes,
    },
  })
  async signupFast(
    @requestBody()
    signupFastRequest: SignupFastRequestDto,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    client: AuthClient,
  ) {
    await this.signupHelperService.validateSignupFastRequest(signupFastRequest);
    const user = new AuthUser(await this.userSignupFn(signupFastRequest, {}));
    user.permissions = [];
    const token = await this.getAuthCode(client, user);
    return {
      code: token,
    };
  }

  @authenticateClient(STRATEGY.CLIENT_PASSWORD)
  @authorize({permissions: ['*']})
  @post(`${basePath}/create-token`, {
    responses: {
      [STATUS_CODE.NO_CONTENT]: {
        description: successResponse,
      },
      ...ErrorCodes,
    },
  })
  async requestSignup(
    @requestBody()
    signupRequest: SignupRequestDto<LocalUserEmailPasswordProfile>,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    client: AuthClient,
    @inject(SignUpBindings.SIGNUP_HANDLER_PROVIDER)
    handler: SignupTokenHandlerFn,
  ): Promise<void> {
    // Default expiry is 30 minutes
    const expiryDuration = parseInt(process.env.REQUEST_SIGNUP_LINK_EXPIRY ?? '1800');

    const codePayload = await this.preSignupFn(signupRequest);
    // TODO: Add client id in preSignupFn?
    codePayload.clientId = client.clientId;

    const token = jwt.sign(codePayload, process.env.JWT_SECRET as string, {
      expiresIn: expiryDuration,
      subject: signupRequest.email,
      issuer: process.env.JWT_ISSUER,
      algorithm: 'HS256',
    });

    await handler({
      code: token,
      expiry: expiryDuration,
      email: signupRequest.email,
    });
  }

  @authenticate(STRATEGY.BEARER, {}, undefined, VerifyBindings.BEARER_SIGNUP_VERIFY_PROVIDER)
  @authorize({permissions: ['*']})
  @post(`${basePath}/create-user`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: successResponse,
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(LocalUserEmailPasswordProfileDto),
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async signupWithToken(
    @requestBody()
    req: LocalUserEmailPasswordProfileDto,
    @inject(AuthenticationBindings.CURRENT_USER)
    signupUser: SignupRequest,
  ): Promise<SignupWithTokenResponseDto<AnyObject>> {
    const user = await this.userSignupFn(req, signupUser);

    return new SignupWithTokenResponseDto<AnyObject>({
      email: req.email,
      user,
    });
  }

  @authenticate(STRATEGY.BEARER, {}, undefined, VerifyBindings.BEARER_SIGNUP_VERIFY_PROVIDER)
  @authorize({permissions: ['*']})
  @get(`${basePath}/verify-token`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: successResponse,
      },
      ...ErrorCodes,
    },
  })
  async verifyInviteToken(
    @inject(AuthenticationBindings.CURRENT_USER)
    signupUser: SignupRequest,
  ): Promise<SignupRequest> {
    return signupUser;
  }
}
