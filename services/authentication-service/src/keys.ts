import {BindingKey, CoreBindings} from '@loopback/core';

import {BINDING_PREFIX} from '@loopx/core';

import {AuthenticationServiceComponent} from './component';
import {ForgotPasswordHandlerFn, JwtPayloadFn} from './providers';
import {ActorId, IAuthServiceConfig, IAuthaConfig, IMfaConfig, IOtpConfig, IUserActivity} from './types';

export {AuthenticationBindings} from '@bleco/authentication';
export {AuthorizationBindings} from '@bleco/authorization';

export namespace AuthServiceBindings {
  export const COMPONENT = BindingKey.create<AuthenticationServiceComponent>(
    `${CoreBindings.COMPONENTS}.${AuthenticationServiceComponent.name}`,
  );

  /**
   * Configuration for the authentication service modules
   */
  export const Config = BindingKey.create<IAuthServiceConfig | null>(`${BINDING_PREFIX}.auth.config`);

  export const MfaConfig = BindingKey.create<IMfaConfig | null>(`${BINDING_PREFIX}.auth.mfa.config`);

  export const OtpConfig = BindingKey.create<IOtpConfig | null>(`${BINDING_PREFIX}.auth.mfa.otp.config`);

  export const AuthaConfig = BindingKey.create<IAuthaConfig | null>(`${BINDING_PREFIX}.auth.autha.config`);

  export const JWTPayloadProvider = BindingKey.create<JwtPayloadFn>(`${BINDING_PREFIX}.auth.jwt.payload`);

  export const ForgotPasswordHandler = BindingKey.create<ForgotPasswordHandlerFn>(
    `${BINDING_PREFIX}.forgetpassword.handler.provider`,
  );
  export const ActorIdKey = BindingKey.create<ActorId>(`${BINDING_PREFIX}.active.users.actorid`);
  export const MarkUserActivity = BindingKey.create<IUserActivity>(`${BINDING_PREFIX}.mark.users.activity`);
}
