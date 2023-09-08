import {ForgetPasswordDto} from './forget-password-dto.model';
import {ForgetPasswordResponseDto} from './forget-password-response-dto.model';
import {LocalUserEmailPasswordProfileDto} from './local-user-profile';
import {LoginActivity} from './login-activity.model';
import {Otp} from './otp.model';
import {OtpCache} from './otp-cache.model';
import {RefreshToken} from './refresh-token.model';
import {RefreshTokenRequest} from './refresh-token-request.model';
import {ResetPasswordWithClient} from './reset-password-with-client.model';
import {RevokedToken} from './revoked-token.model';
import {SignupRequest} from './signup-request.model';
import {SignupRequestDto} from './signup-request-dto.model';
import {SignupRequestResponseDto} from './signup-request-response-dto.model';
import {SignupWithTokenResponseDto} from './signup-with-token-response-dto.model';
import {UserLevelResource} from './user-level-resource.model';

export * from './forget-password-dto.model';
export * from './forget-password-response-dto.model';
export * from './local-user-profile';
export * from './login-activity.model';
export * from './otp.model';
export * from './otp-cache.model';
export * from './refresh-token.model';
export * from './refresh-token-request.model';
export * from './reset-password-with-client.model';
export * from './revoked-token.model';
export * from './signup-request.model';
export * from './signup-request-dto.model';
export * from './signup-request-response-dto.model';
export * from './signup-with-token-response-dto.model';
export * from './user-level-resource.model';

export const models = [
  UserLevelResource,
  RefreshToken,
  RevokedToken,
  Otp,
  OtpCache,
  RefreshTokenRequest,
  ForgetPasswordResponseDto,
  ForgetPasswordDto,
  ResetPasswordWithClient,
  SignupRequestDto,
  SignupRequestResponseDto,
  SignupRequest,
  SignupWithTokenResponseDto,
  LocalUserEmailPasswordProfileDto,
  LoginActivity,
];
