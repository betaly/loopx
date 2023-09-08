import {Provider} from '@loopback/context';
import {AnyObject} from '@loopback/repository';
import {User} from '@loopx/user-core';
import uniqid from 'uniqid';

import {LocalUserProfileDto} from '../models/local-user-profile';
import {UserSignupFn} from '../types';

export class LocalSignupProvider implements Provider<UserSignupFn<LocalUserProfileDto, User>> {
  value(): UserSignupFn<LocalUserProfileDto, User> {
    return async (model: LocalUserProfileDto, tokenInfo?: AnyObject) =>
      new User({
        ...model,
        id: uniqid(),
      });
  }
}
