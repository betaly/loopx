import {BErrors} from 'berrors';
import {verify} from 'jsonwebtoken';
import moment from 'moment-timezone';

import {Constructor, Provider, inject} from '@loopback/context';

import {AuthenticationBindings, EntityWithIdentifier, IAuthUser, VerifyFunction} from '@bleco/authentication';

import {ILogger, LOGGER} from '../../logger-extension';
import {IAuthUserWithPermissions} from '../keys';

export class ServicesBearerTokenVerifyProvider implements Provider<VerifyFunction.BearerFn> {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthenticationBindings.USER_MODEL, {optional: true})
    public authUserModel?: Constructor<EntityWithIdentifier & IAuthUser>,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async (token: string) => {
      let user: IAuthUserWithPermissions;

      try {
        user = verify(token, process.env.JWT_SECRET as string, {
          issuer: process.env.JWT_ISSUER,
          algorithms: ['HS256'],
        }) as IAuthUserWithPermissions;
      } catch (error) {
        this.logger.error(JSON.stringify(error));
        throw new BErrors.Unauthorized('TokenExpired');
      }

      if (user.passwordExpiryTime && moment().isSameOrAfter(moment(user.passwordExpiryTime))) {
        throw new BErrors.Unauthorized('PasswordExpiryError');
      }
      if (this.authUserModel) {
        return new this.authUserModel(user);
      } else {
        return user;
      }
    };
  }
}
