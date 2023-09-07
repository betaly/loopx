/* eslint-disable @typescript-eslint/no-explicit-any */

import {subject} from 'loopback4-acl';

import {UserAuthSubjects} from './permissions';

export function subjectFor<U extends Record<PropertyKey, any>>(
  type: UserAuthSubjects,
  object: Partial<U> & Record<PropertyKey, any>,
): ReturnType<typeof subject<UserAuthSubjects, U>> {
  return subject(type, object);
}
