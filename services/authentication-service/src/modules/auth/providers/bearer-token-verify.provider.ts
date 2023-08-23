import {VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {Request} from '@loopback/rest';
import {AuthErrors, ILogger, LOGGER} from '@loopx/core';
import {BErrors} from 'berrors';
import moment from 'moment-timezone';

import {AuthCodeBindings, JWTVerifierFn} from '../../../providers';
import {RevokedTokenRepository} from '../../../repositories';
import {AuthUser} from '../models/auth-user.model';

export class BearerTokenVerifyProvider implements Provider<VerifyFunction.BearerFn> {
  constructor(
    @repository(RevokedTokenRepository)
    public revokedTokenRepository: RevokedTokenRepository,
    @inject(LOGGER.LOGGER_INJECT) public logger: ILogger,
    @inject(AuthCodeBindings.JWT_VERIFIER)
    public jwtVerifier: JWTVerifierFn<AuthUser>,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async (token: string, req?: Request) => {
      const isRevoked = await this.revokedTokenRepository.get(token);
      if (isRevoked?.token) {
        throw new AuthErrors.TokenRevoked();
      }

      let user: AuthUser;
      try {
        user = await this.jwtVerifier(token, {
          issuer: process.env.JWT_ISSUER,
          algorithms: ['HS256'],
        });
      } catch (error) {
        this.logger.error(JSON.stringify(error));
        throw new BErrors.Unauthorized('TokenExpired');
      }

      if (user.passwordExpiryTime && moment().isSameOrAfter(moment(user.passwordExpiryTime))) {
        throw new AuthErrors.PasswordExpiryError();
      }
      return user;
    };
  }
}
