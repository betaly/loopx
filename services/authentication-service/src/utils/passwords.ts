import {PasswordPolicy} from '@sphericsio/password-sheriff';

export namespace PasswordPolicies {
  export const Low = new PasswordPolicy({
    length: {minLength: 8},
  });
}
