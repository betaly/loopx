import {AuthenticationErrors} from '@bleco/authentication';
import {BindingScope, Getter, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AuthErrors, AuthProvider} from '@loopx/core';
import {User, UserRepository} from '@loopx/user-core';
import bcrypt from 'bcrypt';
import {BErrors} from 'berrors';

import {OtpRepository} from '../repositories';

const saltRounds = 10;

@injectable({scope: BindingScope.SINGLETON})
export class UserAuthService {
  constructor(
    @repository(UserRepository)
    readonly userRepo: UserRepository,
    @repository.getter(OtpRepository)
    readonly getOtpRepository: Getter<OtpRepository>,
  ) {}

  async changePassword(username: string, newPassword: string, oldPassword?: string): Promise<User> {
    const user = await this.userRepo.findOne({where: {username}});
    const creds = user && (await this.userRepo.credentials(user.id).get());

    if (oldPassword) {
      // This method considers old password as OTP
      const otp = await (await this.getOtpRepository()).get(username);
      if (!otp || otp.otp !== oldPassword) {
        throw new AuthenticationErrors.WrongPassword();
      }
    }

    if (creds?.authProvider !== AuthProvider.INTERNAL) {
      throw new AuthErrors.PasswordCannotBeChanged();
    }

    if (!user || user.deleted || !creds?.password) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (await bcrypt.compare(newPassword, creds.password)) {
      throw new BErrors.Unauthorized('Password cannot be same as previous password!');
    } else {
      // DO nothing
    }
    await this.userRepo.credentials(user.id).patch({
      password: await bcrypt.hash(newPassword, saltRounds),
    });
    return user;
  }
}
