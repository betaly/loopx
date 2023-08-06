﻿import {totp} from 'otplib';

import {Provider, inject} from '@loopback/context';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';

import {AuthenticationBindings, AuthenticationErrors, VerifyFunction} from '@bleco/authentication';

import {ILogger, LOGGER} from '@loopx/core';

import {AuthClient, User} from '../../../models';
import {OtpRequest} from '../../../otp/otp';
import {OtpCacheRepository, UserRepository} from '../../../repositories';
import {OtpService} from '../../../services/otp.service';

export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(OtpCacheRepository)
    public otpCacheRepo: OtpCacheRepository,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    private readonly client: AuthClient,
    @service(OtpService)
    private readonly otpService: OtpService,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  value(): VerifyFunction.OtpAuthFn {
    return async (uci: string, otp: string) => {
      let request = OtpRequest.from(uci);

      const userPropKey = request ? request.key : 'username';
      const userPropValue = request ? request.upn : uci;

      const user = (await this.userRepository.findOne({
        where: {
          [userPropKey]: userPropValue,
        },
      })) as User;

      if (!user) {
        this.logger.error(`Invalid OTP Request. Cannot find user with {${userPropKey}: "${userPropValue}"}`);
        throw new AuthenticationErrors.InvalidCredentials();
      }

      if (!request) {
        request = OtpRequest.fromUser(user, uci);
      }
      request.user = user;

      // sender
      if (!otp) {
        await this.otpService.sendOtp(request, this.client);
        return user;
      }

      // verifier
      const otpCache = await this.otpCacheRepo.get(request.uci);
      if (!otpCache) {
        this.logger.error('Invalid OTP Request');
        throw new AuthenticationErrors.OtpExpired();
      }

      let isValid = false;
      try {
        if (otpCache.otpSecret) isValid = totp.check(otp, otpCache.otpSecret);
      } catch (err) {
        this.logger.error(err);
        throw new AuthenticationErrors.InvalidCredentials();
      }
      if (!isValid) {
        throw new AuthenticationErrors.OtpInvalid();
      }

      return user;
    };
  }
}
