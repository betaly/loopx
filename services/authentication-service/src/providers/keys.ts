import {BindingKey} from '@loopback/core';

import {VerifyFunction} from '@bleco/authentication';

import {Role, Tenant} from '../models';
import {PreSignupFn, UserSignupFn} from '../types';
import {AuthCodeGeneratorProvider} from './auth-code-generator.provider';
import {
  ApplePostVerifyFn,
  ApplePreVerifyFn,
  AppleSignUpFn,
  AuthaPostVerifyFn,
  AuthaPreVerifyFn,
  AuthaSignUpFn,
  AzureAdPostVerifyFn,
  AzureAdPreVerifyFn,
  AzureAdSignUpFn,
  CodeReaderFn,
  CodeWriterFn,
  CognitoPostVerifyFn,
  CognitoPreVerifyFn,
  CognitoSignUpFn,
  FacebookPostVerifyFn,
  FacebookPreVerifyFn,
  FacebookSignUpFn,
  GooglePostVerifyFn,
  GooglePreVerifyFn,
  GoogleSignUpFn,
  InstagramPostVerifyFn,
  InstagramPreVerifyFn,
  InstagramSignUpFn,
  JWTSignerFn,
  JWTVerifierFn,
  KeyCloakPostVerifyFn,
  KeyCloakPreVerifyFn,
  KeyCloakSignUpFn,
  MfaCheckFn,
  OtpFn,
  OtpGenerateFn,
  OtpSenderFn,
  SignupTokenHandlerFn,
} from './types';

export namespace SignUpBindings {
  export const GOOGLE_SIGN_UP_PROVIDER = BindingKey.create<GoogleSignUpFn>('ml.google.signup.provider');
  export const INSTAGRAM_SIGN_UP_PROVIDER = BindingKey.create<InstagramSignUpFn>('ml.instagram.signup.provider');
  export const APPLE_SIGN_UP_PROVIDER = BindingKey.create<AppleSignUpFn>('ml.apple.signup.provider');
  export const FACEBOOK_SIGN_UP_PROVIDER = BindingKey.create<FacebookSignUpFn>('ml.facebook.signup.provider');
  export const KEYCLOAK_SIGN_UP_PROVIDER = BindingKey.create<KeyCloakSignUpFn>('ml.keycloak.signup.provider');
  export const AZURE_AD_SIGN_UP_PROVIDER = BindingKey.create<AzureAdSignUpFn>('ml.azuread.signup.provider');
  export const COGNITO_SIGN_UP_PROVIDER = BindingKey.create<CognitoSignUpFn>('ml.cognito.signup.provider');
  export const AUTHA_SIGNUP_PROVIDER = BindingKey.create<AuthaSignUpFn>('ml.autha.signup.provider');
  export const PRE_LOCAL_SIGNUP_PROVIDER = BindingKey.create<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PreSignupFn<any, any> //NOSONAR
  >(`ml.local.presignup.provider`);
  export const LOCAL_SIGNUP_PROVIDER = BindingKey.create<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UserSignupFn<any, any> //NOSONAR
  >(`ml.local.signup.provider`);

  export const SIGNUP_HANDLER_PROVIDER = BindingKey.create<SignupTokenHandlerFn>(`ml.local.signup.handler.provider`);
}

export namespace VerifyBindings {
  export const GOOGLE_PRE_VERIFY_PROVIDER = BindingKey.create<GooglePreVerifyFn>('ml.google.preverify.provider');
  export const GOOGLE_POST_VERIFY_PROVIDER = BindingKey.create<GooglePostVerifyFn>('ml.google.postverify.provider');
  export const INSTAGRAM_POST_VERIFY_PROVIDER = BindingKey.create<InstagramPostVerifyFn>(
    'ml.instgram.postverify.provider',
  );
  export const INSTAGRAM_PRE_VERIFY_PROVIDER = BindingKey.create<InstagramPreVerifyFn>(
    'ml.instagram.preverify.provider',
  );
  export const APPLE_PRE_VERIFY_PROVIDER = BindingKey.create<ApplePreVerifyFn>('ml.apple.preverify.provider');
  export const APPLE_POST_VERIFY_PROVIDER = BindingKey.create<ApplePostVerifyFn>('ml.apple.postverify.provider');
  export const FACEBOOK_POST_VERIFY_PROVIDER = BindingKey.create<FacebookPostVerifyFn>(
    'ml.facebook.postverify.provider',
  );
  export const FACEBOOK_PRE_VERIFY_PROVIDER = BindingKey.create<FacebookPreVerifyFn>('ml.facebook.preverify.provider');
  export const KEYCLOAK_PRE_VERIFY_PROVIDER = BindingKey.create<KeyCloakPreVerifyFn>('ml.keycloak.preverify.provider');
  export const KEYCLOAK_POST_VERIFY_PROVIDER = BindingKey.create<KeyCloakPostVerifyFn>(
    'ml.keycloak.postverify.provider',
  );
  export const COGNITO_PRE_VERIFY_PROVIDER = BindingKey.create<CognitoPreVerifyFn>('ml.cognito.preverify.provider');
  export const COGNITO_POST_VERIFY_PROVIDER = BindingKey.create<CognitoPostVerifyFn>('ml.cognito.postverify.provider');

  export const OTP_PROVIDER = BindingKey.create<OtpFn>('ml.otp.provider');
  export const OTP_GENERATE_PROVIDER = BindingKey.create<OtpGenerateFn>('ml.otp.generate.provider');
  export const OTP_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('ml.otp.sender.provider');
  export const OTP_EMAIL_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('ml.otp.email.sender.provider');
  export const OTP_SMS_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('ml.otp.sms.sender.provider');
  export const PASSWORDLESS_VERIFIER = BindingKey.create<VerifyFunction.LocalPasswordFn>(
    'ml.passwordless.verifier.provider',
  );
  export const MFA_PROVIDER = BindingKey.create<MfaCheckFn>('ml.mfa.check.provider');

  export const BEARER_SIGNUP_VERIFY_PROVIDER = BindingKey.create<VerifyFunction.GenericAuthFn>(
    `ml.bearer.signupverify.provider`,
  );

  export const AZURE_AD_PRE_VERIFY_PROVIDER = BindingKey.create<AzureAdPreVerifyFn>('ml.azure.preverify.provider');
  export const AZURE_AD_POST_VERIFY_PROVIDER = BindingKey.create<AzureAdPostVerifyFn>('ml.azure.postverify.provider');

  export const AUTHA_PRE_VERIFY_PROVIDER = BindingKey.create<AuthaPreVerifyFn>('ml.autha.preverify.provider');
  export const AUTHA_POST_VERIFY_PROVIDER = BindingKey.create<AuthaPostVerifyFn>('ml.autha.postverify.provider');
}

export namespace AuthCodeBindings {
  export const CODEWRITER_PROVIDER = BindingKey.create<CodeWriterFn>('ml.auth.codewriter.provider');

  export const CODEREADER_PROVIDER = BindingKey.create<CodeReaderFn>('ml.auth.codereader.provider');
  export const AUTH_CODE_GENERATOR_PROVIDER = BindingKey.create<AuthCodeGeneratorProvider>(
    'ml.auth-code.generator.provider',
  );
  export const JWT_SIGNER = BindingKey.create<JWTSignerFn<object>>('ml.auth-token.generator.provider');
  export const JWT_VERIFIER = BindingKey.create<JWTVerifierFn<string>>('ml.auth-token.verifier.provider');
}

export namespace AuthEntityBindings {
  export const DEFAULT_TENANT = BindingKey.create<Tenant>(`ml.auth.default.tenant.provider`);
  export const DEFAULT_ROLE = BindingKey.create<Role>(`ml.auth.default.role.provider`);
}
