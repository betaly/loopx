import {Provider, service} from '@loopback/core';

import {AuthaSignUpFn} from '@loopx/authentication-service';

import {UserDto} from '../models';
import {UserOpsService} from '../services';

export class AuthaSignupProvider implements Provider<AuthaSignUpFn> {
  constructor(
    @service(UserOpsService)
    private readonly userOps: UserOpsService,
  ) {}

  value(): AuthaSignUpFn {
    return async profile => {
      return this.userOps.createUser(
        {
          email: profile.email,
          phone: profile.phone,
          username: profile.username,
          name: profile.name,
        } as UserDto,
        {
          authProvider: 'autha',
          authId: profile.id,
        },
      );
    };
  }
}
