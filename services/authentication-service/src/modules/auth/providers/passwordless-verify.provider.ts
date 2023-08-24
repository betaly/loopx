import {AuthenticationBindings, AuthenticationErrors, VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ILogger, LOGGER} from '@loopx/core';
import {totp} from 'otplib';

import {AuthClient, LocalUserProfile, User} from '../../../models';
import {OtpRequest} from '../../../otp/otp';
import {SignUpBindings} from '../../../providers';
import {OtpCacheRepository, UserRepository} from '../../../repositories';
import {OtpService} from '../../../services/otp.service';
import {UserSignupFn} from '../../../types';

export class PasswordlessVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(OtpCacheRepository)
    public otpCacheRepo: OtpCacheRepository,
    @inject(AuthenticationBindings.CURRENT_CLIENT)
    private readonly client: AuthClient,
    @service(OtpService)
    private readonly otpService: OtpService,
    @inject(SignUpBindings.LOCAL_SIGNUP_PROVIDER)
    private readonly signup: UserSignupFn<LocalUserProfile, User>,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  value(): VerifyFunction.OtpAuthFn {
    return async (contact: string, otp: string) => {
      let request = OtpRequest.from(contact);

      const contactPropName = request ? request.contactPropName : 'username';

      const user = (await this.userRepository.findOne({
        where: {
          [contactPropName]: contact,
        },
      })) as User;

      if (!request) {
        if (!user) {
          this.logger.error(`Invalid OTP Request. Cannot find user with {${contactPropName}: "${contact}"}`);
          throw new AuthenticationErrors.InvalidCredentials();
        }
        request = OtpRequest.fromUser(user, contact);
      }

      request.user = user;

      // sender
      if (!otp) {
        this.logger.debug(`Sending OTP to ${contact}`);
        await this.otpService.sendOtp(request, this.client);
        // create a fake user to avoid pass the passport validation
        return (
          user ??
          new User({
            [request.contactPropName]: request.contact,
          })
        );
      }

      // verifier
      this.logger.debug(`Verifying OTP for ${contact}`);
      const otpCache = await this.otpCacheRepo.get(request.contact);
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

      // otp validation passed, sign up the user if not exists
      if (!user) {
        this.logger.debug(`Signing up user ${request.contact}`);
        const newUser = await this.signup({
          [request.contactPropName]: request.contact,
        });
        if (!newUser.id) {
          throw new AuthenticationErrors.InvalidCredentials();
        }
        return newUser;
      }

      return user;
    };
  }
}
