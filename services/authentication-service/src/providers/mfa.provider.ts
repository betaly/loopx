import {Provider} from '@loopback/context';

import {AuthUser} from '../modules/auth';
import {MfaCheckFn} from './types';

export class MfaProvider implements Provider<MfaCheckFn> {
  constructor() {
    // This is intentional
  }

  value(): MfaCheckFn {
    return async (_user: AuthUser) => false;
  }
}
