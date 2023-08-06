import {UserClaims} from '@authajs/passport-autha';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockUserInfo(info?: UserClaims): any {
  return Object.assign(
    {
      sub: '1234567890',
      name: 'John Doe',
      picture: 'https://cdn.iconscout.com/icon/free/png-512/free-avatar-370-456322.png?f=avif&w=256',
      username: 'test',
      email: 'tom@autha.dev',
      email_verified: true,
      phone_number: '106077000000000',
      phone_number_verified: true,
      custom_data: {
        custom1: {
          prop1: 'value1',
        },
      },
      identities: {
        facebook: {
          userId: '106077000000000',
          details: {
            id: '106077000000000',
            name: 'John Joe',
            email: 'johnjoe@example.com',
            avatar: 'https://example.com/avatar.png',
          },
        },
      },
    },
    info,
  );
}
