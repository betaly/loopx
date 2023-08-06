import {PhoneNumberFormat, PhoneNumberUtil} from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function isValidPhoneNumber(number: string) {
  return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(number, 'CN'));
}

export function normalizePhoneNumber(number: string) {
  return phoneUtil.format(phoneUtil.parseAndKeepRawInput(number, 'CN'), PhoneNumberFormat.E164);
}
