import {SUPERADMIN_USER_IDENTIFIER, SUPERADMIN_USER_PASSWORD} from './constants';
import {SuperadminCredentials} from './types';

export const DEFAULT_SUPERADMIN_CREDENTIALS: SuperadminCredentials = {
  identifier: SUPERADMIN_USER_IDENTIFIER,
  password: SUPERADMIN_USER_PASSWORD,
};
