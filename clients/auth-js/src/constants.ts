import version from './version';

/**
 * @ignore
 */
export const DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS = 60;
/**
 * @ignore
 */
export const DEFAULT_SILENT_TOKEN_RETRY_COUNT = 3;

/**
 * @ignore
 */
export const DEFAULT_FETCH_TIMEOUT_MS = 10000;

/**
 * @ignore
 */
export const DEFAULT_AUTH_CLIENT = {
  name: 'auth-js',
  version: version,
};

export const DEFAULT_NOW_PROVIDER = () => Date.now();
