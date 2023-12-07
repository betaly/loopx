import {isAllowedUri} from '../../../utils/uris';

describe('uris', () => {
  describe('isAllowedUri', () => {
    test('matches exact URI without wildcards', () => {
      expect(isAllowedUri('https://example.com/callback', ['https://example.com/callback'])).toBe(true);
    });

    test('matches URI with wildcard at the end', () => {
      expect(isAllowedUri('https://example.com/callback/user', ['https://example.com/callback*'])).toBe(true);
    });

    test('matches URI with wildcard at the beginning', () => {
      expect(isAllowedUri('https://sub.domain.com', ['https://*.domain.com'])).toBe(true);
    });

    test('does not match URI with no relevant pattern', () => {
      expect(isAllowedUri('https://unmatched.com', ['https://example.com/callback*'])).toBe(false);
    });

    test('matches one of multiple URIs', () => {
      expect(
        isAllowedUri('https://example.com/callback/user', ['https://unmatched.com', 'https://example.com/callback*']),
      ).toBe(true);
    });

    test('does not match when URIs list is empty', () => {
      expect(isAllowedUri('https://example.com', [])).toBe(false);
    });
  });
});
