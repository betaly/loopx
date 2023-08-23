import {VerifyFunction} from '@bleco/authentication';
import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';

import {AuthSecureClientRepository} from '../../../repositories';

export class SecureClientPasswordVerifyProvider implements Provider<VerifyFunction.OauthClientPasswordFn> {
  constructor(
    @repository(AuthSecureClientRepository)
    public authSecureClientRepository: AuthSecureClientRepository,
  ) {}

  value(): VerifyFunction.OauthClientPasswordFn {
    return async (clientId: string, clientSecret: string) => {
      return this.authSecureClientRepository.findOne({
        where: {
          clientId,
        },
      });
    };
  }
}
