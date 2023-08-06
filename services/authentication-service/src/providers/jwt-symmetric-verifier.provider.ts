import * as jwt from 'jsonwebtoken';

import {Provider} from '@loopback/core';

import {JWTVerifierFn} from './types';

export class JWTSymmetricVerifierProvider<T> implements Provider<JWTVerifierFn<T>> {
  value(): JWTVerifierFn<T> {
    return async (code: string, options: jwt.VerifyOptions) => {
      const secret = process.env.JWT_SECRET as string;
      const payload = jwt.verify(code, secret, {
        ...options,
        issuer: process.env.JWT_ISSUER,
        algorithms: ['HS256'],
      }) as T;
      return payload;
    };
  }
}
