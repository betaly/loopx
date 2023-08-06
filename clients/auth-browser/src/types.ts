import {BaseAuthClientOptions} from '@loopx/auth-js';

export type CacheProvider = 'memory' | 'localstorage';
export type TransactionStorageProvider = 'cookie' | 'session';

export interface AuthClientOptions extends BaseAuthClientOptions {
  cacheProvider?: CacheProvider;
  transactionStorageProvider?: TransactionStorageProvider;
}
