import {Provider, service} from '@loopback/core';

import {DefaultRole, UserCreationData, UserOperationsService} from '@loopx/user-core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {AuthaSignUpFn} from '@loopx/authentication-service';
import {AuthProvider} from '@loopx/core';

export class AuthaSignupProvider implements Provider<AuthaSignUpFn> {
  constructor(
    @service(UserOperationsService)
    private readonly userOps: UserOperationsService,
  ) {}

  value(): AuthaSignUpFn {
    return async profile => {
      const user = await this.userOps.create(
        new UserCreationData({
          roleId: DefaultRole.User,
          tenantId: DEFAULT_TENANT_CODE,
          userDetails: {
            username: profile.username,
            email: profile.email,
            phone: profile.phone,
            name: profile.name,
          },
        }),
        null,
        {
          authProvider: AuthProvider.AUTHA,
          authId: profile.id,
          activate: true,
        },
      );
      return user.userDetails;
    };
  }
}
