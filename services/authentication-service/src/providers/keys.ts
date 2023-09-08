import {VerifyFunction} from '@bleco/authentication';
import {BindingKey} from '@loopback/core';
import {Role, Tenant} from '@loopx/user-core';

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
  export const GOOGLE_SIGN_UP_PROVIDER = BindingKey.create<GoogleSignUpFn>('loopx.google.signup.provider');
  export const INSTAGRAM_SIGN_UP_PROVIDER = BindingKey.create<InstagramSignUpFn>('loopx.instagram.signup.provider');
  export const APPLE_SIGN_UP_PROVIDER = BindingKey.create<AppleSignUpFn>('loopx.apple.signup.provider');
  export const FACEBOOK_SIGN_UP_PROVIDER = BindingKey.create<FacebookSignUpFn>('loopx.facebook.signup.provider');
  export const KEYCLOAK_SIGN_UP_PROVIDER = BindingKey.create<KeyCloakSignUpFn>('loopx.keycloak.signup.provider');
  export const AZURE_AD_SIGN_UP_PROVIDER = BindingKey.create<AzureAdSignUpFn>('loopx.azuread.signup.provider');
  export const COGNITO_SIGN_UP_PROVIDER = BindingKey.create<CognitoSignUpFn>('loopx.cognito.signup.provider');
  export const AUTHA_SIGNUP_PROVIDER = BindingKey.create<AuthaSignUpFn>('loopx.autha.signup.provider');
  export const PRE_LOCAL_SIGNUP_PROVIDER = BindingKey.create<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PreSignupFn<any, any> //NOSONAR
  >(`loopx.local.presignup.provider`);
  export const LOCAL_SIGNUP_PROVIDER = BindingKey.create<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    UserSignupFn<any, any> //NOSONAR
  >(`loopx.local.signup.provider`);

  export const SIGNUP_HANDLER_PROVIDER = BindingKey.create<SignupTokenHandlerFn>(`loopx.local.signup.handler.provider`);
}

export namespace VerifyBindings {
  export const GOOGLE_PRE_VERIFY_PROVIDER = BindingKey.create<GooglePreVerifyFn>('loopx.google.preverify.provider');
  export const GOOGLE_POST_VERIFY_PROVIDER = BindingKey.create<GooglePostVerifyFn>('loopx.google.postverify.provider');
  export const INSTAGRAM_POST_VERIFY_PROVIDER = BindingKey.create<InstagramPostVerifyFn>(
    'loopx.instgram.postverify.provider',
  );
  export const INSTAGRAM_PRE_VERIFY_PROVIDER = BindingKey.create<InstagramPreVerifyFn>(
    'loopx.instagram.preverify.provider',
  );
  export const APPLE_PRE_VERIFY_PROVIDER = BindingKey.create<ApplePreVerifyFn>('loopx.apple.preverify.provider');
  export const APPLE_POST_VERIFY_PROVIDER = BindingKey.create<ApplePostVerifyFn>('loopx.apple.postverify.provider');
  export const FACEBOOK_POST_VERIFY_PROVIDER = BindingKey.create<FacebookPostVerifyFn>(
    'loopx.facebook.postverify.provider',
  );
  export const FACEBOOK_PRE_VERIFY_PROVIDER = BindingKey.create<FacebookPreVerifyFn>(
    'loopx.facebook.preverify.provider',
  );
  export const KEYCLOAK_PRE_VERIFY_PROVIDER = BindingKey.create<KeyCloakPreVerifyFn>(
    'loopx.keycloak.preverify.provider',
  );
  export const KEYCLOAK_POST_VERIFY_PROVIDER = BindingKey.create<KeyCloakPostVerifyFn>(
    'loopx.keycloak.postverify.provider',
  );
  export const COGNITO_PRE_VERIFY_PROVIDER = BindingKey.create<CognitoPreVerifyFn>('loopx.cognito.preverify.provider');
  export const COGNITO_POST_VERIFY_PROVIDER = BindingKey.create<CognitoPostVerifyFn>(
    'loopx.cognito.postverify.provider',
  );

  export const OTP_PROVIDER = BindingKey.create<OtpFn>('loopx.otp.provider');
  export const OTP_GENERATE_PROVIDER = BindingKey.create<OtpGenerateFn>('loopx.otp.generate.provider');
  export const OTP_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('loopx.otp.sender.provider');
  export const OTP_EMAIL_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('loopx.otp.email.sender.provider');
  export const OTP_SMS_SENDER_PROVIDER = BindingKey.create<OtpSenderFn>('loopx.otp.sms.sender.provider');
  export const PASSWORDLESS_VERIFIER = BindingKey.create<VerifyFunction.LocalPasswordFn>(
    'loopx.passwordless.verifier.provider',
  );
  export const MFA_PROVIDER = BindingKey.create<MfaCheckFn>('loopx.mfa.check.provider');

  export const BEARER_SIGNUP_VERIFY_PROVIDER = BindingKey.create<VerifyFunction.GenericAuthFn>(
    `loopx.bearer.signupverify.provider`,
  );

  export const AZURE_AD_PRE_VERIFY_PROVIDER = BindingKey.create<AzureAdPreVerifyFn>('loopx.azure.preverify.provider');
  export const AZURE_AD_POST_VERIFY_PROVIDER = BindingKey.create<AzureAdPostVerifyFn>(
    'loopx.azure.postverify.provider',
  );

  export const AUTHA_PRE_VERIFY_PROVIDER = BindingKey.create<AuthaPreVerifyFn>('loopx.autha.preverify.provider');
  export const AUTHA_POST_VERIFY_PROVIDER = BindingKey.create<AuthaPostVerifyFn>('loopx.autha.postverify.provider');
}

export namespace AuthCodeBindings {
  export const CODEWRITER_PROVIDER = BindingKey.create<CodeWriterFn>('loopx.auth.codewriter.provider');

  export const CODEREADER_PROVIDER = BindingKey.create<CodeReaderFn>('loopx.auth.codereader.provider');
  export const AUTH_CODE_GENERATOR_PROVIDER = BindingKey.create<AuthCodeGeneratorProvider>(
    'loopx.auth-code.generator.provider',
  );
  export const JWT_SIGNER = BindingKey.create<JWTSignerFn<object>>('loopx.auth-token.generator.provider');
  export const JWT_VERIFIER = BindingKey.create<JWTVerifierFn<string>>('loopx.auth-token.verifier.provider');
}

export namespace AuthEntityBindings {
  export const DEFAULT_TENANT = BindingKey.create<Tenant>(`loopx.auth.default-tenant`);
  export const DEFAULT_ROLE = BindingKey.create<Role>(`loopx.auth.default-role`);
}
