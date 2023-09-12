import {Provider, service} from '@loopback/core';
import {
  DefaultRole,
  pickUserProps,
  User,
  UserCreationData,
  UserOperationsService,
  UserRepository,
} from '@loopx/user-core';

import {SignupDto} from '../models';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {UserSignupFn} from '@loopx/authentication-service';

export class LocalSignupProvider implements Provider<UserSignupFn<SignupDto, User>> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(UserOperationsService)
    public userOps: UserOperationsService,
  ) {}

  value(): UserSignupFn<SignupDto, User> {
    return async (model, token) => {
      const {password, ...data} = model;

      const user = await this.userOps.create(
        new UserCreationData({
          roleId: data.roleId ?? DefaultRole.User,
          tenantId: data.tenantId ?? DEFAULT_TENANT_CODE,
          userDetails: pickUserProps(data),
        }),
        null,
        {activate: true},
      );
      if (password) {
        await this.userRepository.setPassword(
          user.userDetails.username ?? user.userDetails.email ?? user.userDetails.phone,
          password,
        );
      }
      return user.userDetails;
    };
  }
}
