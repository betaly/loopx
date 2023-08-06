import {inject} from '@loopback/context';
import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';

import {ILogger, LOGGER} from '@loopx/core';

import {ValidationErrors} from '../errors';
import {SignupFastRequestDto} from '../models/signup-fast-request.dto.model';
import {UserRepository} from '../repositories';
import {ValidationService} from './validation.service';

@injectable({scope: BindingScope.SINGLETON})
export class SignupHelperService {
  constructor(
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @service(ValidationService)
    private readonly validationService: ValidationService,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
  ) {}

  /**
   * Validate the signup request
   *
   * @param req
   */
  async validateSignupFastRequest(req: SignupFastRequestDto) {
    await this.validationService.validateUsername(req.username);
    this.validationService.validatePassword(req.password);
    if (!req.email && !req.phone) {
      throw new ValidationErrors.EmailOrPhoneRequired();
    }
    if (req.email) {
      await this.validationService.validateEmail(req.email);
    }
    if (req.phone) {
      await this.validationService.validatePhone(req.phone);
    }
  }
}
