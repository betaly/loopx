import {IAuthUser} from '@bleco/authentication';

export interface IUserPrefs {
  locale?: string;
}

export interface IAuthTenantUser<ID = string, TID = string, UTID = string> extends IAuthUser {
  id: string;
  identifier?: ID;
  authClientId: number;
  role: string;
  userPreferences?: IUserPrefs;
  email?: string;
  name?: string;
  tenantId?: TID;
  userTenantId?: UTID;
  passwordExpiryTime?: Date;
  allowedResources?: string[];
  getIdentifier?(): string | undefined;
}
