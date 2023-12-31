﻿import {IAuthUser} from '@bleco/authentication';
import {BindingKey} from '@loopback/context';

import {BINDING_PREFIX} from './globals';

export namespace BearerVerifierBindings {
  export const Config = BindingKey.create<BearerVerifierConfig>(`${BINDING_PREFIX}.bearer-verfier.config`);
}

export enum BearerVerifierType {
  service,
  facade,
}

export interface BearerVerifierConfig {
  type: BearerVerifierType;
  authServiceUrl: string;
}

export interface IUserPrefs {
  locale?: string;
}

export interface IAuthTenantUser<ID = string, TID = string, UTID = string> extends IAuthUser {
  id?: string;
  identifier?: ID;
  permissions: string[];
  authClientId: number;
  userPreferences?: IUserPrefs;
  email?: string;
  role: string;
  tenantId?: TID;
  userTenantId?: UTID;
}
