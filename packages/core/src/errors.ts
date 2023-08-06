import {BErrors} from 'berrors';

export namespace AuthErrors {
  export const UserDoesNotExist = BErrors.Unauthorized.subclass(
    'UserDoesNotExistError',
    'User does not exist',
    'user_does_not_exist',
  );

  export const PasswordCannotBeChanged = BErrors.BadRequest.subclass(
    'PasswordCannotBeChangedError',
    'Password cannot be changed for external user',
    'password_cannot_be_changed',
  );

  export const UserInactive = BErrors.Unauthorized.subclass('UserInactiveError', 'User is inactive', 'user_inactive');

  export const TokenRevoked = BErrors.Unauthorized.subclass(
    'TokenRevokedError',
    'Token has been revoked',
    'token_revoked',
  );

  export const TokenMissing = BErrors.Unauthorized.subclass('TokenMissingError', 'Token is missing', 'token_missing');

  export const TempPasswordLoginDisallowed = BErrors.Unauthorized.subclass(
    'TempPasswordLoginDisallowedError',
    'Temporary password login is disallowed',
    'temp_password_login_disallowed',
  );

  export const PasswordInvalid = BErrors.Unauthorized.subclass(
    'PasswordInvalidError',
    'Invalid password',
    'password_invalid',
  );

  export const UnprocessableData = BErrors.UnprocessableEntity.subclass(
    'UnprocessableDataError',
    'Unprocessable data',
    'unprocessable_data',
  );

  export const PasswordExpiryError = BErrors.Unauthorized.subclass(
    'PasswordExpiryError',
    'Password expiry error',
    'password_expiry_error',
  );
}
