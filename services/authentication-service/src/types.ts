import {AnyObject} from '@loopback/repository';

import {STRATEGY} from '@bleco/authentication';

import {IServiceConfig} from '@loopx/core';

import {OtpMethodType} from './enums';
import {LocalUserProfile, LoginActivity, SignupRequestDto, User, UserTenant} from './models';

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

export type OtpRequestConnectionType = 'email' | 'sms';

export interface IOtpRequest {
  /**
   * The user contact identifier of the user. It is a string in the format of `<conn>:<upn>`.
   * For example:
   * - email:xyz@example.com
   * - sms:+1234567890
   */
  readonly uci: string;
  /**
   * The connection type of the user contact identifier.
   */
  conn: OtpRequestConnectionType;
  /**
   * User principal name. It can be phone number or email address.
   */
  upn: string;
  /**
   * The user object if the user is already registered.
   */
  user?: User | null;
}
