import {
  AuthenticationBindings,
  AuthenticationComponent,
  AuthenticationConfig,
  Strategies,
  STRATEGY,
} from '@bleco/authentication';
import {
  Binding,
  Component,
  ContextTags,
  ControllerClass,
  CoreBindings,
  inject,
  injectable,
  ProviderMap,
  ServiceOrProviderClass,
} from '@loopback/core';
import {Class, Model, Repository} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {LxCoreBindings, LxCoreComponent, matchResources, SECURITY_SCHEME_SPEC} from '@loopx/core';
import {MultiTenancyActionOptions, MultiTenancyBindings, MultiTenancyComponent} from '@loopx/multi-tenancy';
import {UserCoreComponent} from '@loopx/user-core';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {AclComponent} from 'loopback4-acl';

import {ConfigAliaser} from './aliaser';
import {controllers} from './controllers';
import {OtpMethodType} from './enums';
import {AuthServiceBindings} from './keys';
import {models} from './models';
import {
  AppleOauth2VerifyProvider,
  AuthaLogoutProvider,
  AuthaVerifyProvider,
  AuthUser,
  AzureAdVerifyProvider,
  BearerTokenVerifyProvider,
  ClientPasswordVerifyProvider,
  CognitoOauth2VerifyProvider,
  FacebookOauth2VerifyProvider,
  GoogleAuthenticatorVerifyProvider,
  GoogleOauth2VerifyProvider,
  LocalPasswordVerifyProvider,
  OtpVerifyProvider,
  PasswordlessVerifyProvider,
  ResourceOwnerVerifyProvider,
  SecureClientPasswordVerifyProvider,
  SecureResourceOwnerVerifyProvider,
} from './modules/auth';
import {LogoutBindings} from './modules/auth/keys';
import {KeycloakLogoutProvider} from './modules/auth/providers/keycloak-logout.provider';
import {KeycloakVerifyProvider} from './modules/auth/providers/keycloak-verify.provider';
import {
  AppleOauth2SignupProvider,
  ApplePostVerifyProvider,
  ApplePreVerifyProvider,
  AuthaPostVerifyProvider,
  AuthaPreVerifyProvider,
  AuthaSignupProvider,
  AuthEntityBindings,
  AzureAdSignupProvider,
  AzurePostVerifyProvider,
  AzurePreVerifyProvider,
  CodeWriterProvider,
  CognitoOauth2SignupProvider,
  CognitoPostVerifyProvider,
  CognitoPreVerifyProvider,
  FacebookOauth2SignupProvider,
  FacebookPostVerifyProvider,
  FacebookPreVerifyProvider,
  ForgotPasswordProvider,
  GoogleOauth2SignupProvider,
  GooglePostVerifyProvider,
  GooglePreVerifyProvider,
  InstagramOauth2SignupProvider,
  InstagramPostVerifyProvider,
  InstagramPreVerifyProvider,
  JWTAsymmetricSignerProvider,
  JWTAsymmetricVerifierProvider,
  JwtPayloadProvider,
  JWTSymmetricSignerProvider,
  JWTSymmetricVerifierProvider,
  KeyCloakPostVerifyProvider,
  KeyCloakPreVerifyProvider,
  KeyCloakSignupProvider,
  LocalPreSignupProvider,
  LocalSignupProvider,
  OauthCodeReaderProvider,
  OtpGenerateProvider,
  OtpProvider,
  OtpSenderProvider,
  SignupBearerVerifyProvider,
  SignupTokenHandlerProvider,
  TenantResolverProvider,
} from './providers';
import {AuthCodeGeneratorProvider} from './providers/auth-code-generator.provider';
import {DefaultRoleProvider} from './providers/default-role.provider';
import {DefaultTenantProvider} from './providers/default-tenant.provider';
import {AuthCodeBindings, SignUpBindings, VerifyBindings} from './providers/keys';
import {MfaProvider} from './providers/mfa.provider';
import {OtpEmailSenderProvider} from './providers/otp-email-sender.provider';
import {OtpSmsSenderProvider} from './providers/otp-sms-sender.provider';
import {repositories} from './repositories';
import {MySequence} from './sequence';
import {services} from './services';
import {IAuthServiceConfig, IMfaConfig, IOtpConfig} from './types';

@injectable({
  tags: {[ContextTags.KEY]: AuthServiceBindings.COMPONENT},
})
export class AuthenticationServiceComponent implements Component {
  providers: ProviderMap;
  bindings: Binding[];
  /**
   * An optional list of Repository classes to bind for dependency injection
   * via `app.repository()` API.
   */
  repositories?: Class<Repository<Model>>[];
  /**
   * An optional list of Model classes to bind for dependency injection
   * via `app.model()` API.
   */
  models?: Class<Model>[];
  /**
   * An array of controller classes
   */
  controllers?: ControllerClass[];

  /**
   * An array of service or provider classes
   */
  services?: ServiceOrProviderClass[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(AuthServiceBindings.MfaConfig, {optional: true})
    private readonly mfaConfig: IMfaConfig,
    @inject(AuthServiceBindings.OtpConfig, {optional: true})
    private readonly otpConfig: IOtpConfig,
    @inject(AuthServiceBindings.Config, {optional: true})
    private readonly authConfig?: IAuthServiceConfig,
    @inject(AuthenticationBindings.CONFIG, {optional: true})
    private readonly config?: AuthenticationConfig,
  ) {
    ConfigAliaser.bind(application);

    this.bindings = [];
    this.providers = {};

    if (!this.application.isBound(`${CoreBindings.COMPONENTS}.${LxCoreComponent.name}`)) {
      // Mount core component
      this.application.component(LxCoreComponent);
    }

    this.application.component(UserCoreComponent);

    if (+(process.env.AZURE_AUTH_ENABLED ?? 0)) {
      const expressMiddlewares = this.application.getSync(LxCoreBindings.EXPRESS_MIDDLEWARES) ?? [];
      expressMiddlewares.push(cookieParser());
      expressMiddlewares.push(bodyParser.urlencoded({extended: true}));
      this.application.bind(LxCoreBindings.EXPRESS_MIDDLEWARES).to(expressMiddlewares);
    }

    // Mount authentication component
    this.setupAuthenticationComponent(this.config?.secureClient);
    this.setupMultiFactorAuthentication();

    // Mount authorization component
    this.setupAuthorizationComponent();

    // Mount logout providers
    this.setupLogoutProviders();

    // Mount MultiTenancy component
    this.setupMultiTenancyComponent();

    this.application.api({
      openapi: '3.0.0',
      info: {
        title: 'Authentication Service',
        version: '1.0.0',
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      servers: [{url: '/'}],
    });

    // Mount default sequence if needed
    if (!authConfig?.useCustomSequence) {
      // Mount default sequence if needed
      this.setupSequence();
    }

    this.controllers = matchResources(controllers, authConfig?.controllers);

    this.application.bind(AuthServiceBindings.ActorIdKey).to('userId');
    this.application.bind(AuthServiceBindings.MarkUserActivity).to({markUserActivity: false});

    this.repositories = repositories;
    this.services = services;
    this.models = models;

    // TODO: session middleware
  }

  /**
   * Setup ServiceSequence by default if no other sequence provided
   */
  setupSequence() {
    this.application.sequence(MySequence);
  }

  setupAuthenticationComponent(secureClient = false) {
    // Add authentication component
    this.application.component(AuthenticationComponent);
    // Customize authentication verify handlers
    if (!secureClient) {
      this.providers[Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER.key] = ClientPasswordVerifyProvider;
      this.providers[Strategies.Passport.RESOURCE_OWNER_PASSWORD_VERIFIER.key] = ResourceOwnerVerifyProvider;
    } else {
      this.providers[Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER.key] = SecureClientPasswordVerifyProvider;
      this.providers[Strategies.Passport.RESOURCE_OWNER_PASSWORD_VERIFIER.key] = SecureResourceOwnerVerifyProvider;
    }

    this.providers[Strategies.Passport.BEARER_TOKEN_VERIFIER.key] = BearerTokenVerifyProvider;
    this.providers[Strategies.Passport.LOCAL_PASSWORD_VERIFIER.key] = LocalPasswordVerifyProvider;
    this.providers[Strategies.Passport.GOOGLE_OAUTH2_VERIFIER.key] = GoogleOauth2VerifyProvider;
    this.providers[Strategies.Passport.APPLE_OAUTH2_VERIFIER.key] = AppleOauth2VerifyProvider;
    this.providers[Strategies.Passport.FACEBOOK_OAUTH2_VERIFIER.key] = FacebookOauth2VerifyProvider;
    this.providers[Strategies.Passport.COGNITO_OAUTH2_VERIFIER.key] = CognitoOauth2VerifyProvider;
    this.providers[Strategies.Passport.KEYCLOAK_VERIFIER.key] = KeycloakVerifyProvider;
    this.providers[Strategies.Passport.AUTHA_VERIFIER.key] = AuthaVerifyProvider;
    this.providers[SignUpBindings.KEYCLOAK_SIGN_UP_PROVIDER.key] = KeyCloakSignupProvider;
    this.providers[SignUpBindings.GOOGLE_SIGN_UP_PROVIDER.key] = GoogleOauth2SignupProvider;
    this.providers[SignUpBindings.INSTAGRAM_SIGN_UP_PROVIDER.key] = InstagramOauth2SignupProvider;
    this.providers[SignUpBindings.APPLE_SIGN_UP_PROVIDER.key] = AppleOauth2SignupProvider;
    this.providers[SignUpBindings.FACEBOOK_SIGN_UP_PROVIDER.key] = FacebookOauth2SignupProvider;
    this.providers[SignUpBindings.COGNITO_SIGN_UP_PROVIDER.key] = CognitoOauth2SignupProvider;
    this.providers[SignUpBindings.LOCAL_SIGNUP_PROVIDER.key] = LocalSignupProvider;
    this.providers[SignUpBindings.PRE_LOCAL_SIGNUP_PROVIDER.key] = LocalPreSignupProvider;
    this.providers[SignUpBindings.SIGNUP_HANDLER_PROVIDER.key] = SignupTokenHandlerProvider;
    this.providers[SignUpBindings.AUTHA_SIGNUP_PROVIDER.key] = AuthaSignupProvider;
    this.providers[VerifyBindings.KEYCLOAK_PRE_VERIFY_PROVIDER.key] = KeyCloakPreVerifyProvider;
    this.providers[VerifyBindings.KEYCLOAK_POST_VERIFY_PROVIDER.key] = KeyCloakPostVerifyProvider;
    this.providers[VerifyBindings.GOOGLE_PRE_VERIFY_PROVIDER.key] = GooglePreVerifyProvider;
    this.providers[VerifyBindings.GOOGLE_POST_VERIFY_PROVIDER.key] = GooglePostVerifyProvider;
    this.providers[VerifyBindings.INSTAGRAM_PRE_VERIFY_PROVIDER.key] = InstagramPreVerifyProvider;
    this.providers[VerifyBindings.INSTAGRAM_POST_VERIFY_PROVIDER.key] = InstagramPostVerifyProvider;
    this.providers[VerifyBindings.APPLE_PRE_VERIFY_PROVIDER.key] = ApplePreVerifyProvider;
    this.providers[VerifyBindings.APPLE_POST_VERIFY_PROVIDER.key] = ApplePostVerifyProvider;
    this.providers[VerifyBindings.FACEBOOK_PRE_VERIFY_PROVIDER.key] = FacebookPreVerifyProvider;
    this.providers[VerifyBindings.FACEBOOK_POST_VERIFY_PROVIDER.key] = FacebookPostVerifyProvider;
    this.providers[VerifyBindings.COGNITO_PRE_VERIFY_PROVIDER.key] = CognitoPreVerifyProvider;
    this.providers[VerifyBindings.COGNITO_POST_VERIFY_PROVIDER.key] = CognitoPostVerifyProvider;
    this.providers[VerifyBindings.BEARER_SIGNUP_VERIFY_PROVIDER.key] = SignupBearerVerifyProvider;
    this.providers[VerifyBindings.AUTHA_PRE_VERIFY_PROVIDER.key] = AuthaPreVerifyProvider;
    this.providers[VerifyBindings.AUTHA_POST_VERIFY_PROVIDER.key] = AuthaPostVerifyProvider;
    this.providers[AuthCodeBindings.CODEREADER_PROVIDER.key] = OauthCodeReaderProvider;
    this.providers[AuthCodeBindings.CODEWRITER_PROVIDER.key] = CodeWriterProvider;
    this.providers[AuthCodeBindings.AUTH_CODE_GENERATOR_PROVIDER.key] = AuthCodeGeneratorProvider;

    this.application.bind(AuthenticationBindings.USER_MODEL.key).to(AuthUser);

    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PRIVATE_KEY !== '') {
      this.providers[AuthCodeBindings.JWT_SIGNER.key] = JWTAsymmetricSignerProvider;
    } else {
      this.providers[AuthCodeBindings.JWT_SIGNER.key] = JWTSymmetricSignerProvider;
    }
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PRIVATE_KEY !== '') {
      this.providers[AuthCodeBindings.JWT_VERIFIER.key] = JWTAsymmetricVerifierProvider;
    } else {
      this.providers[AuthCodeBindings.JWT_VERIFIER.key] = JWTSymmetricVerifierProvider;
    }
    this.providers[AuthServiceBindings.JWTPayloadProvider.key] = JwtPayloadProvider;
    this.providers[AuthServiceBindings.ForgotPasswordHandler.key] = ForgotPasswordProvider;

    this.providers[AuthEntityBindings.DEFAULT_TENANT.key] = DefaultTenantProvider;
    this.providers[AuthEntityBindings.DEFAULT_ROLE.key] = DefaultRoleProvider;

    this.providers[Strategies.Passport.AZURE_AD_VERIFIER.key] = AzureAdVerifyProvider;
    this.providers[SignUpBindings.AZURE_AD_SIGN_UP_PROVIDER.key] = AzureAdSignupProvider;
    this.providers[VerifyBindings.AZURE_AD_PRE_VERIFY_PROVIDER.key] = AzurePreVerifyProvider;
    this.providers[VerifyBindings.AZURE_AD_POST_VERIFY_PROVIDER.key] = AzurePostVerifyProvider;
  }

  setupAuthorizationComponent() {
    // Add authorization component
    // if (!this.application.isBound(AuthorizationBindings.CONFIG)) {
    //   this.application.bind(AuthorizationBindings.CONFIG).to({
    //     allowAlwaysPaths: ['/explorer'],
    //   });
    // }
    // this.application.component(AuthorizationComponent);
    this.application.component(AclComponent);
  }

  setupMultiFactorAuthentication() {
    this.providers[VerifyBindings.MFA_PROVIDER.key] = MfaProvider;

    if (this.mfaConfig?.secondFactor === STRATEGY.OTP) {
      if (this.otpConfig?.method === OtpMethodType.OTP) {
        this.providers[VerifyBindings.OTP_GENERATE_PROVIDER.key] = OtpGenerateProvider;
        this.providers[VerifyBindings.OTP_SENDER_PROVIDER.key] = OtpSenderProvider;
        this.providers[VerifyBindings.OTP_EMAIL_SENDER_PROVIDER.key] = OtpEmailSenderProvider;
        this.providers[VerifyBindings.OTP_SMS_SENDER_PROVIDER.key] = OtpSmsSenderProvider;
        this.providers[VerifyBindings.OTP_PROVIDER.key] = OtpProvider;
        this.providers[Strategies.Passport.OTP_VERIFIER.key] = OtpVerifyProvider;
        this.providers[VerifyBindings.PASSWORDLESS_VERIFIER.key] = PasswordlessVerifyProvider;
      } else if (this.otpConfig?.method === OtpMethodType.GOOGLE_AUTHENTICATOR) {
        this.providers[Strategies.Passport.OTP_VERIFIER.key] = GoogleAuthenticatorVerifyProvider;
        this.providers[VerifyBindings.PASSWORDLESS_VERIFIER.key] = GoogleAuthenticatorVerifyProvider;
      } else {
        // do nothing
      }
    }
  }

  setupLogoutProviders() {
    this.providers[LogoutBindings.AUTHA_LOGOUT_PROVIDER.key] = AuthaLogoutProvider;
    this.providers[LogoutBindings.KEYCLOAK_LOGOUT_PROVIDER.key] = KeycloakLogoutProvider;
  }

  setupMultiTenancyComponent() {
    this.application.configure<MultiTenancyActionOptions>(MultiTenancyBindings.ACTION).to({
      strategyNames: ['header', 'jwt', 'query'],
    });
    this.application.component(MultiTenancyComponent);
    this.providers[MultiTenancyBindings.TENANT_RESOLVER.key] = TenantResolverProvider;
  }
}
