import {BindingKey} from '@loopback/context';

import {BINDING_PREFIX} from '../../constants';

export namespace BearerVerifierBindings {
  export const Config = BindingKey.create<BearerVerifierConfig>(`${BINDING_PREFIX}.bearer-verfier.config`);
}

export enum BearerVerifierType {
  service,
  facade,
}

export interface BearerVerifierConfig {
  type: BearerVerifierType;
}

// export interface IAuthUserWithPermissions<ID = string, TID = string, UTID = string>
//   extends MarkOptional<OmitIndexSignature<IAuthTenantUser<ID, TID, UTID>>, 'id'> {
//   permissions: string[];
//
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [attribute: string]: any;
// }
