import {LoginActivityRepository} from './login-activity.repository';
import {OtpRepository} from './otp.repository';
import {OtpCacheRepository} from './otp-cache.repository';
import {RefreshTokenRepository} from './refresh-token.repository';
import {RevokedTokenRepository} from './revoked-token.repository';
import {UserLevelResourceRepository} from './user-level-resource.repository';

export * from './login-activity.repository';
export * from './otp.repository';
export * from './otp-cache.repository';
export * from './refresh-token.repository';
export * from './revoked-token.repository';
export * from './user-level-resource.repository';

export const repositories = [
  RefreshTokenRepository,
  RevokedTokenRepository,
  OtpCacheRepository,
  OtpRepository,
  UserLevelResourceRepository,
  LoginActivityRepository,
];
