import {Provider, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {DefaultRole, User, UserDto, UserOperationsService, UserRepository} from '@loopx/user-core';
import pick from 'tily/object/pick';

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
        new UserDto({
          roleId: data.roleId ?? DefaultRole.User,
          tenantId: data.tenantId ?? DEFAULT_TENANT_CODE,
          userTenantId: data.userTenantId,
          details: new User(pick(Object.keys(SignupDto.definition.properties), data)),
        }),
        null,
        {activate: true},
      );
      if (password) {
        await this.userRepository.setPassword(
          user.details.username ?? user.details.email ?? user.details.phone,
          password,
        );
      }
      return user.details;
    };
  }
}
