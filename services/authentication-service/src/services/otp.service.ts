import {AuthenticationErrors} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ILogger, LOGGER} from '@loopx/core';

import {AuthClient} from '../models';
import {OtpResponse} from '../modules/auth';
import {OtpRequest} from '../otp/otp';
import {OtpFn, VerifyBindings} from '../providers';
import {OtpCacheRepository, UserRepository} from '../repositories';
import {IOtpRequest} from '../types';

@injectable({scope: BindingScope.SINGLETON})
export class OtpService {
  constructor(
    @repository(OtpCacheRepository)
    private readonly otpCacheRepo: OtpCacheRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(VerifyBindings.OTP_PROVIDER, {optional: true})
    private readonly otpSender: OtpFn,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  async sendOtp(request: IOtpRequest | string, client?: AuthClient): Promise<OtpResponse | void> {
    if (!client) {
      this.logger.error('Auth client not found or invalid');
      throw new AuthenticationErrors.ClientInvalid();
    }
    const req = typeof request === 'string' ? OtpRequest.from(request) : request;
    if (!req) {
      this.logger.error('Otp applicant is invalid');
      throw new AuthenticationErrors.InvalidCredentials();
    }

    const res: OtpResponse = await this.otpSender(req);

    await this.otpCacheRepo.delete(req.contact);
    await this.otpCacheRepo.set(req.contact, {
      otpSecret: res.key,
      clientId: client.clientId,
      clientSecret: client.secret,
    });
  }
}
