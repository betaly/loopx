import parsePhoneNumber from 'libphonenumber-js';

export {isValidPhoneNumber} from 'libphonenumber-js';

export function normalizePhoneNumber(number: string) {
  // return phoneUtil.format(phoneUtil.parseAndKeepRawInput(number, 'CN'), PhoneNumberFormat.E164);
  const phoneNumber = parsePhoneNumber(number);
  return phoneNumber?.format('E.164');
}
