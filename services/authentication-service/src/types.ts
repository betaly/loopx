import {STRATEGY} from '@bleco/authentication';
import {AnyObject} from '@loopback/repository';
import {IServiceConfig} from '@loopx/core';
import {User, UserTenant} from '@loopx/user-core';

import {OtpMethodType} from './enums';
import {LocalUserProfile, LoginActivity, SignupRequestDto} from './models';

export const AuthDbSourceName = 'AuthDB';
export const AuthCacheSourceName = 'AuthCache';

export interface IAuthServiceConfig extends Partial<IServiceConfig> {
  defaultTenantKey?: string;
  defaultRoleKey?: string;
  controllers?: string[];
}

export interface IMfaConfig {
  secondFactor: STRATEGY;
}
export interface IUserActivity {
  markUserActivity: boolean;
}
export interface IOtpConfig {
  method: OtpMethodType;
}

export interface IAuthaConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
}

export interface PreSignupFn<T, S> {
  (request: SignupRequestDto<T>): Promise<S>;
}

export interface UserSignupFn<T, S> {
  (model: T & LocalUserProfile, tokenInfo?: AnyObject): Promise<S>;
}

export interface IAuthClientDTO {
  // sonarignore:start
  client_id: string;
  client_secret: string;
  // sonarignore:end
}

export interface ExternalTokens {
  externalAuthToken?: string;
  externalRefreshToken?: string;
}

export type ActorId = Extract<keyof UserTenant, string>;

export interface ActiveUsersGroupData {
  [key: string]: {
    [loginType: string]: Array<LoginActivity>;
  };
}

export type OtpRequestMethod = 'email' | 'sms';

export interface IOtpRequest {
  /**
   * The connection type of the user contact identifier.
   */
  method: OtpRequestMethod;
  /**
   * The contact identifier. It can be phone number or email address.
   */
  contact: string;
  /**
   * The user object if the user is already registered.
   */
  user?: User | null;
}
