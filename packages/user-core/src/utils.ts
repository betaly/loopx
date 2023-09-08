/* eslint-disable @typescript-eslint/no-explicit-any */

import {Where} from '@loopback/repository';
import {BErrors} from 'berrors';
import {subject} from 'loopback4-acl';

import {User} from './models';
import {UserAuthSubjects} from './subjects';

export function subjectFor<U extends Record<PropertyKey, any>>(
  type: UserAuthSubjects,
  object: Partial<U> & Record<PropertyKey, any>,
): ReturnType<typeof subject<UserAuthSubjects, U>> {
  return subject(type, object);
}

export function buildWhereClauseFromIdentifier(identifier: string): Where<User> {
  return {
    or: [{username: identifier}, {email: identifier}, {phone: identifier}],
  };
}

export function buildWhereClauseFromPossibleIdentifiers(
  identifiers: Partial<Pick<User, 'username' | 'email' | 'phone'>>,
): Where<User> {
  if (!identifiers.username && !identifiers.email && !identifiers.phone) {
    throw new BErrors.BadRequest('username or email or phone is required');
  }

  return {
    or: (Object.keys(identifiers) as Array<keyof typeof identifiers>)
      .filter(key => identifiers[key])
      .map(key => ({[key]: identifiers[key]})),
  };
}
