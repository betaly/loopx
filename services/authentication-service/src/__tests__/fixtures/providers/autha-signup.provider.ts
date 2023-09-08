import {Provider, service} from '@loopback/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {DefaultRole, User, UserDto, UserOperationsService} from '@loopx/user-core';

import {AuthaSignUpFn} from '../../../providers';

export class AuthaSignupProvider implements Provider<AuthaSignUpFn> {
  constructor(
    @service(UserOperationsService)
    private readonly userOps: UserOperationsService,
  ) {}

  value(): AuthaSignUpFn {
    return async profile => {
      const user = await this.userOps.create(
        new UserDto({
          roleId: DefaultRole.Member,
          tenantId: DEFAULT_TENANT_CODE,
          details: new User({
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            name: profile.name,
          }),
        }),
        null,
        {
          authProvider: 'autha',
          authId: profile.id,
          activate: true,
        },
      );
      return user.details;
    };
  }
}
