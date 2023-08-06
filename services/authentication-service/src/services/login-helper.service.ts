import {BErrors} from 'berrors';

import {inject} from '@loopback/context';
import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';

import {AuthenticationErrors} from '@bleco/authentication';

import {ILogger, LOGGER, UserStatus} from '@loopx/core';

import {AuthClient, IAuthClientDTO, UserTenant} from '..';
import {AuthUser} from '../modules/auth/models/auth-user.model';
import {UserTenantRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class LoginHelperService {
  constructor(
    @repository(UserTenantRepository)
    private readonly userTenantRepo: UserTenantRepository,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {}

  async verifyClientUserLogin(
    req: IAuthClientDTO,
    client?: AuthClient,
    reqUser?: Pick<AuthUser, 'id' | 'authClientIds'> | null,
  ): Promise<Pick<UserTenant, 'status'> | null> {
    const currentUser = reqUser;
    if (!client) {
      this.logger.error('Auth client not found or invalid');
      throw new AuthenticationErrors.ClientInvalid();
    }
    if (!currentUser) {
      this.logger.error('Auth user not found or invalid');
      throw new AuthenticationErrors.InvalidCredentials();
    }

    const userStatus: Pick<UserTenant, 'status'> | null = await this.userTenantRepo.findOne({
      where: {
        userId: currentUser.id,
      },
      fields: {
        status: true,
      },
    });

    // if (!currentUser.authClientIds || currentUser.authClientIds.length === 0) {
    //   this.logger.error('No allowed auth clients found for this user in DB');
    //   throw new AuthenticationErrors.ClientUserMissing();
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // }
    //
    // if ((currentUser.authClientIds as any).indexOf(client.id ?? 0) < 0) {
    //   this.logger.error('User is not allowed to access client id passed in request');
    //   throw new AuthenticationErrors.ClientInvalid();
    // }

    if (userStatus?.status === UserStatus.REGISTERED) {
      this.logger.error('User is in registered state');
      throw new BErrors.BadRequest('User not active yet');
    }

    return userStatus;
  }
}
