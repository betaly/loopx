import {BErrors} from 'berrors';

export namespace ValidationErrors {
  export const InvalidEmail = BErrors.BadRequest.subclass('InvalidEmailError', 'Invalid email', 'invalid_email');

  export const InvalidPhone = BErrors.BadRequest.subclass('InvalidPhoneError', 'Invalid phone', 'invalid_phone');
  export const InvalidPassword = BErrors.BadRequest.subclass(
    'InvalidPasswordError',
    'Invalid password',
    'invalid_password',
  );

  export const InvalidSignup = BErrors.BadRequest.subclass(
    'InvalidSignupError',
    'The user you are attempting to sign up is invalid',
    'invalid_signup',
  );

  export const UsernameTooShort = BErrors.BadRequest.subclass(
    'UsernameTooShortError',
    'The username you are attempting to sign up with is too short',
    'username_too_short',
  );

  export const UsernameTooLong = BErrors.BadRequest.subclass(
    'UsernameTooLongError',
    'The username you are attempting to sign up with is too long',
    'username_too_long',
  );

  export const EmailOrPhoneRequired = BErrors.BadRequest.subclass(
    'EmailOrPhoneRequiredError',
    'Either an email or phone number is required',
    'email_or_phone_required',
  );

  export const PasswordDictionaryError = BErrors.BadRequest.subclass(
    'PasswordDictionaryError',
    'The chosen password is too common',
    'password_dictionary_error',
  );

  export const PasswordNoUserInfoError = BErrors.BadRequest.subclass(
    'PasswordNoUserInfoError',
    'The chosen password is based on user information',
    'password_no_user_info_error',
  );

  export const PasswordStrengthError = BErrors.BadRequest.subclass(
    'PasswordStrengthError',
    'The chosen password is too weak',
    'password_strength_error',
  );

  export const Unauthorized = BErrors.Unauthorized.subclass(
    'UnauthorizedError',
    'If you cannot sign up for this application. May have to do with the violation of a specific rule',
    'unauthorized',
  );

  export const UserExists = BErrors.BadRequest.subclass(
    'UserExistsError',
    'The user you are attempting to sign up has already signed up',
    'user_exists',
  );

  export const UsernameExists = BErrors.BadRequest.subclass(
    'UsernameExistsError',
    'The username you are attempting to sign up with is already in use',
    'username_exists',
  );

  export const EmailExists = BErrors.BadRequest.subclass(
    'EmailExistsError',
    'The email you are attempting to sign up with is already in use',
    'email_exists',
  );

  export const PhoneExists = BErrors.BadRequest.subclass(
    'PhoneExistsError',
    'The phone you are attempting to sign up with is already in use',
    'phone_exists',
  );
}
