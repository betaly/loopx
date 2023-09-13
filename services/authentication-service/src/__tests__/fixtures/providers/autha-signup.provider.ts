import {Provider, service} from '@loopback/core';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import {DefaultRole, TenantUserData, UserOperationsService} from '@loopx/user-core';

import {AuthaSignUpFn} from '../../../providers';

export class AuthaSignupProvider implements Provider<AuthaSignUpFn> {
  constructor(
    @service(UserOperationsService)
    private readonly userOps: UserOperationsService,
  ) {}

  value(): AuthaSignUpFn {
    return async profile => {
      const user = await this.userOps.create(
        new TenantUserData({
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
          authProvider: 'autha',
          authId: profile.id,
          activate: true,
        },
      );
      return user.userDetails;
    };
  }
}
