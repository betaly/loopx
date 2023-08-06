import {authenticator} from 'otplib';

import {Provider, inject} from '@loopback/context';
import {repository} from '@loopback/repository';

import {AuthenticationErrors, VerifyFunction} from '@bleco/authentication';

import {ILogger, LOGGER} from '@loopx/core';

import {UserCredentials} from '../../../models';
import {OtpCacheRepository, UserCredentialsRepository, UserRepository} from '../../../repositories';

export class GoogleAuthenticatorVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @repository(OtpCacheRepository)
    public otpCacheRepo: OtpCacheRepository,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  value(): VerifyFunction.OtpAuthFn {
    return async (username: string, otp: string) => {
      const user = await this.userRepository.findOne({
        where: {
          username: username,
        },
      });
      if (!user) {
        this.logger.error('Invalid Username');
        throw new AuthenticationErrors.InvalidCredentials();
      }

      const authenticatorSecret: Pick<UserCredentials, 'secretKey'> | null = await this.userCredsRepository.findOne({
        where: {
          userId: user.id,
        },
        fields: {
          secretKey: true,
        },
      });

      if (!authenticatorSecret?.secretKey) {
        throw new AuthenticationErrors.InvalidCredentials();
      }

      let isValid = false;
      try {
        isValid = authenticator
          .create(authenticator.allOptions())
          .verify({token: otp, secret: authenticatorSecret.secretKey});
      } catch (err) {
        this.logger.error(err);
        throw new AuthenticationErrors.InvalidCredentials();
      }
      if (!isValid) {
        throw new AuthenticationErrors.OtpExpired();
      }
      return user;
    };
  }
}
