import {VerifyFunction} from '@bleco/authentication';
import {inject, Provider} from '@loopback/context';
import {Request} from '@loopback/rest';
import {ILogger, LOGGER} from '@loopx/core';
import {BErrors} from 'berrors';
import {verify} from 'jsonwebtoken';

import {SignupRequest} from '../models/signup-request.model';

export class SignupBearerVerifyProvider implements Provider<VerifyFunction.BearerFn<SignupRequest>> {
  constructor(@inject(LOGGER.LOGGER_INJECT) public logger: ILogger) {}

  value(): VerifyFunction.BearerFn<SignupRequest> {
    return async (token: string, req?: Request) => {
      let result: SignupRequest;
      try {
        result = verify(token, process.env.JWT_SECRET as string, {
          issuer: process.env.JWT_ISSUER,
          algorithms: ['HS256'],
        }) as SignupRequest;
      } catch (error) {
        this.logger.error(JSON.stringify(error));
        throw new BErrors.Unauthorized('TokenExpired');
      }
      return result;
    };
  }
}
