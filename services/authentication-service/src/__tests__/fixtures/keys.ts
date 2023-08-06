import {BindingKey} from '@loopback/context';

import {IAuthUser} from '@bleco/authentication';

import {BINDING_PREFIX} from './globals';

export namespace BearerVerifierBindings {
  export const Config = BindingKey.create<BearerVerifierConfig>(`${BINDING_PREFIX}.bearer-verfier.config`);
}

export const TestHelperKey = 'services.TestHelperService';

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

export interface IAuthUserWithPermissions<ID = string, TID = string, UTID = string> extends IAuthUser {
  id?: string;
  identifier?: ID;
  permissions: string[];
  authClientId: number;
  userPreferences?: IUserPrefs;
  email?: string;
  role: string;
  name?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  tenantId?: TID;
  userTenantId?: UTID;
}
