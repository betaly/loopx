import {Provider, service} from '@loopback/core';

import {UserSignupFn} from '@loopx/authentication-service';
import {User} from '@loopx/user-service';

import {UserDto} from '../models';
import {UserOpsService} from '../services';

export class LocalSignupProvider implements Provider<UserSignupFn<UserDto, User>> {
  constructor(
    @service(UserOpsService)
    private readonly userOps: UserOpsService,
  ) {}

  value(): UserSignupFn<UserDto, User> {
    return async model => this.userOps.createUser(model, {});
  }
}
