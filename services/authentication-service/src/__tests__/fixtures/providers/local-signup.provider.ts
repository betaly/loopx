import {Provider, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {
  DefaultRole,
  pickUserProps,
  TenantUserData,
  User,
  UserOperationsService,
  UserRepository,
} from '@loopx/user-core';

import {UserSignupFn} from '../../../types';
import {SignupDto} from '../models';

export class TestLocalSignupProvider implements Provider<UserSignupFn<SignupDto, User>> {
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
        new TenantUserData({
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
