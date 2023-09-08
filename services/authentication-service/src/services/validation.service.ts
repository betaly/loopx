import {inject} from '@loopback/context';
import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ILogger, LOGGER} from '@loopx/core';
import {UserRepository} from '@loopx/user-core';
import length from 'tily/array/length';

import {ValidationErrors} from '../errors';
import {isValidEmail} from '../utils/email';
import {PasswordPolicies} from '../utils/passwords';
import {isValidPhoneNumber} from '../utils/phone';

@injectable({scope: BindingScope.SINGLETON})
export class ValidationService {
  constructor(
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  async validateUsername(username: string) {
    if (length(username) < 4) {
      throw new ValidationErrors.UsernameTooShort({data: {minLength: 4}});
    }
    if (length(username) > 32) {
      throw new ValidationErrors.UsernameTooLong({data: {maxLength: 32}});
    }
    const user = await this.userRepository.findOne({where: {username}, fields: {id: true}});
    if (user) {
      throw new ValidationErrors.UsernameExists();
    }
  }

  validatePassword(password: string) {
    const {verified, rules} = PasswordPolicies.Low.missing(password);
    if (!verified) {
      throw new ValidationErrors.PasswordStrengthError({data: rules});
    }
  }

  async validateEmail(email: string) {
    if (!isValidEmail(email)) {
      throw new ValidationErrors.InvalidEmail();
    }
    const user = await this.userRepository.findOne({where: {email}, fields: {id: true}});
    if (user) {
      throw new ValidationErrors.EmailExists();
    }
  }

  async validatePhone(number: string) {
    if (!isValidPhoneNumber(number)) {
      throw new ValidationErrors.InvalidPhone();
    }
    const user = await this.userRepository.findOne({where: {phone: number}, fields: {id: true}});
    if (user) {
      throw new ValidationErrors.PhoneExists();
    }
  }
}
