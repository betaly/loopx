import {User} from '../models';
import {IOtpRequest, OtpRequestMethod} from '../types';
import {isValidEmail} from '../utils/email';
import {isValidPhoneNumber} from '../utils/phone';

export type OtpConnectionUserKey = 'phone' | 'email';

export const OtpSupportedMethods: OtpRequestMethod[] = ['sms', 'email'];
export const OtpMethodUserKeyMap: Record<OtpRequestMethod, OtpConnectionUserKey> = {
  sms: 'phone',
  email: 'email',
};

export class OtpRequest implements IOtpRequest {
  readonly contactPropName: string;

  constructor(readonly method: OtpRequestMethod, readonly contact: string, public user?: User) {
    this.contactPropName = OtpMethodUserKeyMap[this.method];
  }

  static from(contact: string): OtpRequest | undefined {
    const method = resolveMethodByContact(contact);
    if (method) {
      return new OtpRequest(method, contact);
    }
  }

  static fromUser(user: User, contact: string): OtpRequest {
    for (const method of OtpSupportedMethods) {
      const key = OtpMethodUserKeyMap[method];
      if (user[key]) {
        return new OtpRequest(method, contact, user);
      }
    }
    throw new Error(`Cannot find any contact (both email and phone number) from user ${user.id}`);
  }
}

function resolveMethodByContact(contact: string): OtpRequestMethod | undefined {
  if (isValidEmail(contact)) {
    return 'email';
  } else if (isValidPhoneNumber(contact)) {
    return 'sms';
  }
}
