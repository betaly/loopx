import {AuthenticationBindings, EntityWithIdentifier, IAuthUser, VerifyFunction} from '@bleco/authentication';
import {Constructor, inject, Provider} from '@loopback/context';
import {BErrors} from 'berrors';
import * as fs from 'fs/promises';
import {verify} from 'jsonwebtoken';
import moment from 'moment-timezone';

import {IAuthTenantUser} from '../../../auth.types';
import {ILogger, LOGGER} from '../../logger-extension';

export class ServicesBearerAsymmetricTokenVerifyProvider implements Provider<VerifyFunction.BearerFn> {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthenticationBindings.USER_MODEL, {optional: true})
    public authUserModel?: Constructor<EntityWithIdentifier & IAuthUser>,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async (token: string) => {
      let user: IAuthTenantUser;

      try {
        const publicKey = await fs.readFile(process.env.JWT_PUBLIC_KEY ?? '');
        user = verify(token, publicKey, {
          issuer: process.env.JWT_ISSUER,
          algorithms: ['RS256'],
        }) as IAuthTenantUser;
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
