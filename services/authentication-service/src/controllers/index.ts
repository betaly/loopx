import {AppleLoginController} from '../modules/auth/apple-login.controller';
import {AuthaLoginController} from '../modules/auth/autha-login.controller';
import {AzureLoginController} from '../modules/auth/azure-login.controller';
import {CognitoLoginController} from '../modules/auth/cognito-login.controller';
import {FacebookLoginController} from '../modules/auth/facebook-login.controller';
import {GoogleLoginController} from '../modules/auth/google-login.controller';
import {InstagramLoginController} from '../modules/auth/instagram-login.controller';
import {KeycloakLoginController} from '../modules/auth/keycloak-login.controller';
import {LoginController} from '../modules/auth/login.controller';
import {LogoutController} from '../modules/auth/logout.controller';
import {OtpController} from '../modules/auth/otp.controller';
import {PasswordlessController} from '../modules/auth/passwordless.controller';
import {ForgetPasswordController} from './forget-password.controller';
import {LoginActivityController} from './login-activity.controller';
import {SignupController} from './signup.controller';
import {TokensController} from './tokens.controller';

export * from '../modules/auth/login.controller';
export * from '../modules/auth/logout.controller';
export * from '../modules/auth/otp.controller';
export * from './forget-password.controller';
export * from './login-activity.controller';
export * from './signup.controller';
export * from './tokens.controller';

export const controllers = [
  TokensController,
  LoginController,
  GoogleLoginController,
  FacebookLoginController,
  AppleLoginController,
  KeycloakLoginController,
  InstagramLoginController,
  LogoutController,
  OtpController,
  PasswordlessController,
  ForgetPasswordController,
  SignupController,
  AzureLoginController,
  CognitoLoginController,
  AuthaLoginController,
  LoginActivityController,
];
