import {Provider, service} from '@loopback/core';

import {User} from '../../../models';
import {UserSignupFn} from '../../../types';
import {UserDto} from '../models';
import {UserOpsService} from '../services';

export class TestLocalSignupProvider implements Provider<UserSignupFn<UserDto, User>> {
  constructor(
    @service(UserOpsService)
    private readonly userOps: UserOpsService,
  ) {}

  value(): UserSignupFn<UserDto, User> {
    return async (model, token) => this.userOps.createUser(model, {});
  }
}
