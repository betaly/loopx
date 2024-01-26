/* eslint-disable @typescript-eslint/no-explicit-any */

import {STRATEGY} from '@bleco/authentication';
import {AnyObject} from '@loopback/repository';
import {Response} from '@loopback/rest';
import {IServiceConfig} from '@loopx/core';
import {User, UserTenant} from '@loopx/user-core';
import {CookieSerializeOptions} from 'cookie';

import {OtpMethodType} from './enums';
import {LocalUserProfile, LoginActivity, SignupRequestDto} from './models';

export const AuthDbSourceName = 'AuthDB';
export const AuthCacheSourceName = 'AuthCache';

export interface PagesOptions {
  webMessage?: string;
}

export interface IAuthServiceConfig extends Partial<IServiceConfig> {
  defaultTenantKey?: string;
  defaultRoleKey?: string;
  controllers?: string[];
  pages?: PagesOptions;
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

export interface Cookie {
  name: string;
  value: string;
  options: CookieSerializeOptions;
}

// Should only be used by frameworks
export interface ResponseInternal<Body extends string | Record<string, any> | any[] | null = any> {
  status?: number;
  headers?: Headers;
  body?: Body;
  redirect?: string;
  cookies?: Cookie[];
}

export interface WebMessageResult {
  code: string;
  role?: string;
  state?: string | null;
}

export interface WebMessageError {
  error: string;
  error_description: string;
}

export type WebMessageData = WebMessageResult | WebMessageError;

export interface AuthPages {
  webMessage(data: WebMessageData, response: Response): void;
}

export interface IAuthClientDTO {
  client_id: string;
  client_secret: string;
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
