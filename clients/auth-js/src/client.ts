import {MarkRequired} from 'ts-essentials';

import {fetchToken, postLogout} from './api';
import {urlSafeBase64} from './base64';
import {
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CacheEntry,
  CacheKey,
  CacheKeyManifest,
  CacheManager,
  DecodedToken,
  IdTokenEntry,
  InMemoryCache,
} from './cache';
import {GET_TOKEN_SILENTLY_LOCK_KEY, getAuthorizeParams} from './client.utils';
import {DEFAULT_AUTH_CLIENT, DEFAULT_FETCH_TIMEOUT_MS, DEFAULT_NOW_PROVIDER} from './constants';
import {AuthenticationError, GenericError, MissingRefreshTokenError} from './errors';
import {singlePromise} from './promise-utils';
import {InMemoryStorage} from './storage';
import {verify as verifyIdToken} from './tokens';
import {TransactionManager} from './transaction-manager';
import {
  AuthorizationParams,
  AuthorizeOptions,
  BaseAuthClientOptions,
  CodeRequestTokenOptions,
  Fetcher,
  GetTokenSilentlyOptions,
  LogoutOptions,
  RedirectLoginOptions,
  RefreshTokenRequestTokenOptions,
  TokenEndpointResponse,
  User,
} from './types';
import {
  createQueryParams,
  getDomain,
  getTokenIssuer,
  parseAuthenticationResult,
  parseNumber,
  stringToBase64UrlEncoded,
} from './utils';

export abstract class BaseAuthClient<Options extends BaseAuthClientOptions = BaseAuthClientOptions> {
  readonly domainUrl: string;
  readonly loginPath: string;
  readonly logoutPath: string;

  protected transactionManager: TransactionManager;
  protected options: MarkRequired<Options, 'authorizationParams'>;
  protected cacheManager: CacheManager;
  protected tokenIssuer: string;
  protected fetcher: Fetcher;
  protected nowProvider: () => number | Promise<number>;
  protected httpTimeoutMs: number;
  protected userCache = new InMemoryCache();

  protected defaultOptions: Partial<Options> = {};

  constructor(options: Options) {
    this.options = {
      ...this.defaultOptions,
      ...options,
      authorizationParams: {
        ...this.defaultOptions.authorizationParams,
        ...options.authorizationParams,
      },
    } as MarkRequired<Options, 'authorizationParams'>;

    if (!this.options.domain) {
      throw new Error('domain option is required');
    }

    if (!this.options.clientId) {
      throw new Error('clientId option is required');
    }

    if (!this.options.loginPath) {
      throw new Error('loginPath is required');
    }

    this.domainUrl = getDomain(this.options.domain);
    this.loginPath = this.options.loginPath;
    this.logoutPath = this.options.logoutPath ?? '/logout';
    this.tokenIssuer = getTokenIssuer(this.options.issuer, this.domainUrl);

    this.httpTimeoutMs = options.httpTimeoutInSeconds ? options.httpTimeoutInSeconds * 1000 : DEFAULT_FETCH_TIMEOUT_MS;

    this.fetcher = this.options.fetcher ?? (fetch as Fetcher);
    this.nowProvider = this.options.nowProvider || DEFAULT_NOW_PROVIDER;

    this.transactionManager = new TransactionManager(this.initTransactionStorage(), this.options.clientId);

    const cache = this.initCache();
    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys ? new CacheKeyManifest(cache, this.options.clientId) : undefined,
      this.nowProvider,
    );
  }

  /**
   * ```js
   * await auth.loginWithRedirect(options);
   * ```
   *
   * Performs a redirect to `/authorize` using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   *
   * @param options
   */
  public async loginWithRedirect(options: RedirectLoginOptions = {}) {
    const {fragment, appState, ...urlOptions} = options;
    const openUrl = options.openUrl ?? this.options.openUrl;

    const {url, ...transaction} = await this._prepareAuthorizeUrl(urlOptions.authorizationParams || {});

    this.transactionManager.create({
      ...transaction,
      appState,
    });

    const urlWithFragment = fragment ? `${url}#${fragment}` : url;

    if (openUrl) {
      return openUrl(urlWithFragment);
    }
    throw new Error('You need to specify an openUrl function to use loginWithRedirect');
  }

  /**
   * ```js
   * await client.logout(options);
   * ```
   *
   * Clears the application session and performs a redirect to `/logout`, using
   * the parameters provided as arguments, to clear the Auth0 session.
   *
   * If the `federated` option is specified it also clears the Identity Provider session.
   * [Read more about how Logout works at Auth0](https://auth0.com/docs/logout).
   *
   * @param options
   */
  public async logout(options: LogoutOptions = {}) {
    const openUrl = options.openUrl ?? this.options.openUrl;
    const clientId = options.clientId || this.options.clientId;
    const entry = await this.cacheManager.get(new CacheKey({clientId}));

    if (options.clientId === null) {
      await this.cacheManager.clear();
    } else {
      await this.cacheManager.clear(clientId);
    }

    // this.cookieStorage.remove(this.orgHintCookieName, {
    //   cookieDomain: this.options.cookieDomain,
    // });
    // this.cookieStorage.remove(this.isAuthenticatedCookieName, {
    //   cookieDomain: this.options.cookieDomain,
    // });

    this.userCache.remove(CACHE_KEY_ID_TOKEN_SUFFIX);

    if (entry?.accessToken) {
      const res = await postLogout(
        {
          url: this._logoutUrl({clientId}),
          accessToken: entry.accessToken,
          refreshToken: entry.refreshToken,
        },
        this.fetcher,
      );
      const url = res.logoutUrl;
      if (url) {
        if (openUrl) {
          return openUrl(url);
        } else if (openUrl === false) {
          return;
        }
        throw new Error('You need to specify an openUrl function to use logout');
      }
    }
  }

  /**
   * After the browser redirects back to the callback page,
   * call `handleRedirectCallback` to handle success and error
   * responses from Auth0. If the response is successful, results
   * will be valid according to their expiration times.
   */
  public async handleRedirectCallback(url: string) {
    const queryStringFragments = url.split('?').slice(1);

    if (queryStringFragments.length === 0) {
      throw new Error('There are no query params available for parsing.');
    }

    const {code, error, error_description} = parseAuthenticationResult(queryStringFragments.join(''));

    const transaction = this.transactionManager.get();

    if (!transaction) {
      throw new GenericError('missing_transaction', 'Invalid state');
    }

    this.transactionManager.remove();

    if (error) {
      throw new AuthenticationError(error, error_description || error);
    }

    await this._requestToken({
      code: code as string,
      clientId: this.options.clientId,
    });

    return true;
  }

  /**
   * Fetches a new access token and returns the response from the /oauth/token endpoint, omitting the refresh token.
   *
   * @param options
   */
  public async getTokenSilently(
    options: GetTokenSilentlyOptions & {detailedResponse: true},
  ): Promise<TokenEndpointResponse>;

  /**
   * Fetches a new access token and returns it.
   *
   * @param options
   */
  public async getTokenSilently(options?: GetTokenSilentlyOptions): Promise<string>;

  /**
   * Fetches a new access token, and either returns just the access token (the default) or the response from the /oauth/token endpoint, depending on the `detailedResponse` option.
   *
   * ```js
   * const token = await auth0.getTokenSilently(options);
   * ```
   *
   * If there's a valid token stored and it has more than 60 seconds
   * remaining before expiration, return the token. Otherwise, attempt
   * to obtain a new token.
   *
   * A new token will be obtained either by opening an iframe or a
   * refresh token (if `useRefreshTokens` is `true`).

   * If iframes are used, opens an iframe with the `/authorize` URL
   * using the parameters provided as arguments. Random and secure `state`
   * and `nonce` parameters will be auto-generated. If the response is successful,
   * results will be validated according to their expiration times.
   *
   * If refresh tokens are used, the token endpoint is called directly with the
   * 'refreshToken' grant. If no refresh token is available to make this call,
   * the SDK will only fall back to using an iframe to the '/authorize' URL if
   * the `useRefreshTokensFallback` setting has been set to `true`. By default this
   * setting is `false`.
   *
   * This method may use a web worker to perform the token call if the in-memory
   * cache is used.
   *
   * If an `audience` value is given to this function, the SDK always falls
   * back to using an iframe to make the token exchange.
   *
   * Note that in all cases, falling back to an iframe requires access to
   * the `auth0` cookie.
   *
   * @param options
   */
  public async getTokenSilently(
    options: GetTokenSilentlyOptions = {},
  ): Promise<undefined | string | TokenEndpointResponse> {
    const localOptions: GetTokenSilentlyOptions & {
      authorizationParams: AuthorizationParams;
    } = {
      cacheMode: 'on',
      ...options,
      authorizationParams: {
        ...this.options.authorizationParams,
        ...options.authorizationParams,
      },
    };

    const result = await singlePromise(() => this._getTokenSilently(localOptions), this.options.clientId);

    return options.detailedResponse ? result : result?.accessToken;
  }

  /**
   * ```js
   * const isAuthenticated = await auth0.isAuthenticated();
   * ```
   *
   * Returns `true` if there's valid information stored,
   * otherwise returns `false`.
   *
   */
  public async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  }

  public async isLoginRedirected(url: string): Promise<boolean> {
    const transaction = this.transactionManager.get();

    if (!transaction) {
      return false;
    }
    const {redirect_uri} = transaction;
    const {origin, pathname} = new URL(url);

    return `${origin}${pathname}` === redirect_uri;
  }

  /**
   * ```js
   * const user = await auth0.getUser();
   * ```
   *
   * Returns the user information if available (decoded
   * from the `id_token`).
   *
   * @typeparam TUser The type to return, has to extend {@link User}.
   */
  public async getUser<TUser extends User>(): Promise<TUser | undefined> {
    const cache = await this._getIdTokenFromCache();

    return cache?.decodedToken?.user as TUser;
  }

  protected initTransactionStorage() {
    return this.options.transactionStorage ?? new InMemoryStorage();
  }

  protected initCache() {
    return this.options.cache ?? new InMemoryCache();
  }

  /**
   * ```ts
   * protected async runInLock(key: string, fn: <T>() => Promise<T>) {
   *   if (await retryPromise(() => lock.acquireLock(GET_TOKEN_SILENTLY_LOCK_KEY, 5000), 10)) {
   *     try {
   *       window.addEventListener('pagehide', this._releaseLockOnPageHide);
   *       return await fn();
   *     } finally {
   *       window.removeEventListener('pagehide', this._releaseLockOnPageHide);
   *       lock.releaseLock(GET_TOKEN_SILENTLY_LOCK_KEY);
   *     }
   *   } else {
   *     throw new TimeoutError();
   *   }
   * }
   *
   * private _releaseLockOnPageHide = async () => {
   *   await lock.releaseLock(GET_TOKEN_SILENTLY_LOCK_KEY);
   *   window.removeEventListener('pagehide', this._releaseLockOnPageHide);
   * };
   * ```
   *
   * @param key
   * @param fn
   * @protected
   */
  protected async runInLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  private async _getTokenSilently(
    options: GetTokenSilentlyOptions & {
      authorizationParams: AuthorizationParams;
    },
  ): Promise<undefined | TokenEndpointResponse> {
    const {cacheMode, ...getTokenOptions} = options;

    // Check the cache before acquiring the lock to avoid the latency of
    // `lock.acquireLock` when the cache is populated.
    if (cacheMode !== 'off') {
      const entry = await this._getEntryFromCache(this.options.clientId);

      if (entry) {
        return entry;
      }
    }

    if (cacheMode === 'cache-only') {
      return;
    }

    return this.runInLock(GET_TOKEN_SILENTLY_LOCK_KEY, async () => {
      // Check the cache a second time, because it may have been populated
      // by a previous call while this call was waiting to acquire the lock.
      if (cacheMode !== 'off') {
        const entry = await this._getEntryFromCache(this.options.clientId);

        if (entry) {
          return entry;
        }
      }

      // const authResult = this.options.useRefreshTokens
      //   ? await this._getTokenUsingRefreshToken(getTokenOptions)
      //   : await this._getTokenFromIFrame(getTokenOptions);

      const authResult = await this._getTokenUsingRefreshToken(getTokenOptions);

      const {accessToken, refreshToken, expiresIn} = authResult;

      return {
        accessToken,
        refreshToken,
        expiresIn,
      };
    });
  }

  private async _getTokenUsingRefreshToken(
    options: GetTokenSilentlyOptions & {
      authorizationParams: AuthorizationParams;
    },
  ): Promise<TokenEndpointResponse> {
    const cache = await this.cacheManager.get(
      new CacheKey({
        clientId: this.options.clientId,
      }),
    );

    // If you don't have a refresh token in memory
    // and you don't have a refresh token in web worker memory
    // and useRefreshTokensFallback was explicitly enabled
    // fallback to an iframe
    // -------------------------------------------------------
    if (!cache?.refreshToken) {
      if (this.options.useRefreshTokensFallback) {
        return this._getTokenFromIFrame(options);
      }

      throw new MissingRefreshTokenError('', '');
    }

    // const redirect_uri =
    //   options.authorizationParams.redirect_uri ||
    //   this.options.authorizationParams.redirect_uri ||
    //   (typeof window !== 'undefined' ? window.location.origin : '');

    const timeout = typeof options.timeoutInSeconds === 'number' ? options.timeoutInSeconds * 1000 : null;

    return this._requestToken({
      ...options.authorizationParams,
      refreshToken: cache?.refreshToken,
      // redirect_uri,
      ...(timeout && {timeout}),
    } as RefreshTokenRequestTokenOptions);
  }

  private async _getTokenFromIFrame(
    options: GetTokenSilentlyOptions & {
      authorizationParams: AuthorizationParams;
    },
  ): Promise<TokenEndpointResponse> {
    throw new Error('Not implemented');
  }

  private _url(path: string) {
    const authClient = encodeURIComponent(
      urlSafeBase64.encode(JSON.stringify(this.options.authClient || DEFAULT_AUTH_CLIENT)),
    );
    return `${this.domainUrl}${path}&authClient=${authClient}`;
  }

  private _authorizeUrl(authorizeOptions: AuthorizeOptions) {
    return this._url(`${this.loginPath}?${createQueryParams(authorizeOptions)}`);
  }

  private _logoutUrl(logoutOptions = {}) {
    return this._url(`${this.logoutPath}?${createQueryParams(logoutOptions)}`);
  }

  private async _prepareAuthorizeUrl(
    authorizationParams: AuthorizationParams,
    fallbackRedirectUri?: string,
  ): Promise<{
    url: string;
    redirect_uri?: string;
    client_verifier: string;
    timestamp: number;
  }> {
    const {clientId, clientSecret} = this.options;
    const timestamp = await this.nowProvider();
    const client_verifier = `${clientId}.${clientSecret ?? ''}.${timestamp}`;
    const client_challenge = stringToBase64UrlEncoded(client_verifier);
    const redirect_uri =
      authorizationParams.redirect_uri || this.options.authorizationParams.redirect_uri || fallbackRedirectUri;

    const params = getAuthorizeParams(this.options, authorizationParams, timestamp, client_challenge, redirect_uri);
    const url = this._authorizeUrl(params);

    return {
      url,
      redirect_uri,
      client_verifier,
      timestamp,
    };
  }

  private async _requestToken(options: CodeRequestTokenOptions | RefreshTokenRequestTokenOptions) {
    const authResult = await fetchToken(
      {
        baseUrl: this.domainUrl,
        clientId: (options as CodeRequestTokenOptions).clientId ?? this.options.clientId,
        authClient: this.options.authClient,
        useFormData: this.options.useFormData,
        timeout: this.httpTimeoutMs,
        ...options,
      },
      this.fetcher,
    );

    const decodedToken = await this._verifyIdToken(authResult.accessToken);

    await this._saveEntryInCache({
      ...authResult,
      idToken: authResult.accessToken,
      decodedToken,
      clientId: this.options.clientId,
    });

    // this.cookieStorage.save(this.isAuthenticatedCookieName, true, {
    //   daysUntilExpire: this.sessionCheckExpiryDays,
    //   cookieDomain: this.options.cookieDomain,
    // });

    // this._processOrgIdHint(decodedToken.claims.org_id);

    return {...authResult, decodedToken};
  }

  private async _verifyIdToken(token: string) {
    const now = await this.nowProvider();

    return verifyIdToken({
      iss: this.tokenIssuer,
      aud: this.options.clientId,
      token,
      max_age: parseNumber(this.options.authorizationParams.max_age),
      now,
    });
  }

  private async _saveEntryInCache(entry: CacheEntry & {idToken: string; decodedToken: DecodedToken}) {
    const {idToken, decodedToken, ...entryWithoutIdToken} = entry;

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, {
      idToken,
      decodedToken,
    });

    await this.cacheManager.setIdToken(this.options.clientId, entry.accessToken, entry.decodedToken);

    await this.cacheManager.set(entryWithoutIdToken);
  }

  private async _getEntryFromCache(clientId: string): Promise<undefined | TokenEndpointResponse> {
    const entry = await this.cacheManager.get(
      new CacheKey({
        clientId,
      }),
      60, // get a new token if within 60 seconds of expiring
    );

    if (entry?.accessToken) {
      const {accessToken, expiresIn} = entry as CacheEntry;
      const cache = await this._getIdTokenFromCache();
      return (
        cache && {
          accessToken,
          expiresIn,
        }
      );
    }
  }

  private async _getIdTokenFromCache() {
    const cache = await this.cacheManager.getIdToken(
      new CacheKey({
        clientId: this.options.clientId,
      }),
    );

    const currentCache = this.userCache.get<IdTokenEntry>(CACHE_KEY_ID_TOKEN_SUFFIX) as IdTokenEntry;

    // If the id_token in the cache matches the value we previously cached in memory return the in-memory
    // value so that object comparison will work
    if (cache?.idToken && cache.idToken === currentCache?.idToken) {
      return currentCache;
    }

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, cache);
    return cache;
  }
}
