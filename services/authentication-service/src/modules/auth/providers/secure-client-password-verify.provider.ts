import {VerifyFunction} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {AuthClientRepository} from '@loopx/user-core';

export class SecureClientPasswordVerifyProvider implements Provider<VerifyFunction.OauthClientPasswordFn> {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepository: AuthClientRepository,
  ) {}

  value(): VerifyFunction.OauthClientPasswordFn {
    return async (clientId: string, clientSecret: string) => {
      return this.authClientRepository.findOne({
        where: {
          clientId,
        },
      });
    };
  }
}
