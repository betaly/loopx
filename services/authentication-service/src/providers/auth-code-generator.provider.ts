import {ClientAuthCode, STRATEGY} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {service} from '@loopback/core';
import * as jwt from 'jsonwebtoken';

import {OtpMethodType} from '../enums';
import {AuthServiceBindings} from '../keys';
import {User} from '../models';
import {OtpRequest} from '../otp/otp';
import {OtpService} from '../services';
import {IMfaConfig, IOtpConfig} from '../types';
import {AuthCodeBindings, VerifyBindings} from './keys';
import {AuthCodeGeneratorFn, CodeWriterFn, MfaCheckFn} from './types';

export class AuthCodeGeneratorProvider implements Provider<AuthCodeGeneratorFn> {
  constructor(
    @service(OtpService)
    private readonly otpService: OtpService,
    @inject(VerifyBindings.MFA_PROVIDER)
    private readonly checkMfa: MfaCheckFn,
    @inject(AuthCodeBindings.CODEWRITER_PROVIDER)
    private readonly codeWriter: CodeWriterFn,
    @inject(AuthServiceBindings.MfaConfig, {optional: true})
    private readonly mfaConfig: IMfaConfig,
    @inject(AuthServiceBindings.OtpConfig, {optional: true})
    private readonly otpConfig: IOtpConfig,
  ) {}

  value(): AuthCodeGeneratorFn {
    return async (client, user) => {
      const codePayload: ClientAuthCode<User, typeof User.prototype.id> = {
        clientId: client.clientId,
        user,
      };
      const isMfaEnabled = await this.checkMfa(user);
      if (isMfaEnabled) {
        codePayload.mfa = true;
        if (this.mfaConfig.secondFactor === STRATEGY.OTP && this.otpConfig.method === OtpMethodType.OTP) {
          await this.otpService.sendOtp(OtpRequest.fromUser(user, user.username), client);
        }
      }
      return this.codeWriter(
        jwt.sign(codePayload, client.secret, {
          expiresIn: client.authCodeExpiration,
          audience: client.clientId,
          issuer: process.env.JWT_ISSUER,
          algorithm: 'HS256',
        }),
      );
    };
  }
}
