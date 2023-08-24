import {isValidPhoneNumber, normalizePhoneNumber} from '../../../utils/phone';

describe('PhoneNumber utils', function () {
  const ValidNumbers = ['+8613012345678', '+1 (202) 456-1414', '+1 202 456 1414', '+12024561414', '+1 202-456-1414'];

  const InvalidNumbers = ['123456789', '123', '202-456-1414', '(202) 456-1414', '202.456.1414', '202/4561414'];

  it('valid phone number', function () {
    ValidNumbers.forEach(number => {
      expect(isValidPhoneNumber(number)).toBeTruthy();
    });
  });
  it('invalid phone number', function () {
    InvalidNumbers.forEach(number => {
      expect(isValidPhoneNumber(number)).toBeFalsy();
    });
  });

  it('normalize phone number', () => {
    expect(normalizePhoneNumber('+86 130 1234 5678')).toEqual('+8613012345678');
    expect(normalizePhoneNumber('+1 (202) 456-1414')).toEqual('+12024561414');
  });
});
