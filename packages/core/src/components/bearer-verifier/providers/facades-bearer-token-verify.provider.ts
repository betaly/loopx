﻿import {BErrors} from 'berrors';
import {verify} from 'jsonwebtoken';
import moment from 'moment';

import {Constructor, Provider, inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {Request} from '@loopback/rest';

import {AuthenticationBindings, EntityWithIdentifier, IAuthUser, VerifyFunction} from '@bleco/authentication';

import {ILogger, LOGGER} from '../../logger-extension';
import {IAuthUserWithPermissions} from '../keys';
import {RevokedTokenRepository} from '../repositories';

export class FacadesBearerTokenVerifyProvider implements Provider<VerifyFunction.BearerFn> {
  constructor(
    @repository(RevokedTokenRepository)
    public revokedTokenRepository: RevokedTokenRepository,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @inject(AuthenticationBindings.USER_MODEL, {optional: true})
    public authUserModel?: Constructor<EntityWithIdentifier & IAuthUser>,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async (token: string, req?: Request) => {
      try {
        const isRevoked = await this.revokedTokenRepository.get(token);
        if (isRevoked?.token) {
          throw new BErrors.Unauthorized('TokenRevoked');
        }
      } catch (error) {
        if (BErrors.Error.prototype.isPrototypeOf.call(BErrors.Error.prototype, error)) {
          throw error;
        }
        this.logger.error('Revoked token repository not available !');
      }

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
