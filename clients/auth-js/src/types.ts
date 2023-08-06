import {ICache} from './cache';
import {ClientStorage} from './storage';

export type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  credentials?: 'include' | 'omit';
  body?: string;
  signal?: AbortSignal;
  timeout?: number;
};

export type Fetcher = <T extends ReturnType<typeof fetch>>(url: string, options?: FetchOptions) => Promise<T>;

export interface AuthorizationParams {
  interaction_mode?: InteractionMode;
  /**
   * Maximum allowable elapsed time (in seconds) since authentication.
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated.
   */
  max_age?: string | number;
  /**
   * The default URL where Auth will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  redirect_uri?: string;

  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: any;
}

interface OptionsWithAuthorizationParams {
  /**
   * URL parameters that will be sent back to the Authorization Server. This can be known parameters
   * defined by Auth or custom parameters that you define.
   */
  authorizationParams?: AuthorizationParams;
}

export interface BaseAuthClientOptions extends OptionsWithAuthorizationParams {
  /**
   * The auth service domain or base URL.
   */
  domain: string;

  /**
   /**
   * The Client ID
   */
  clientId: string;
  /**
   * The Client Secret
   */
  clientSecret?: string;

  loginPath: string;

  logoutPath?: string;

  /**
   * The issuer to be used for validation of JWTs, optionally defaults to the domain above
   */
  issuer?: string;

  /**
   * Specify the timeout for HTTP calls using `fetch`. The default is 10 seconds.
   */
  httpTimeoutInSeconds?: number;

  /**
   * Internal property to send information about the client to the authorization server.
   * @internal
   */
  authClient?: {
    name: string;
    version: string;
    env?: {[key: string]: string};
  };

  /**
   *
   */
  transactionStorage?: ClientStorage;

  /**
   * Specify a custom cache implementation to use for token storage and retrieval. This setting takes precedence over `cacheLocation` if they are both specified.
   */
  cache?: ICache;

  /**
   * If true, refresh tokens are used to fetch new access tokens from the Auth server. If false, the legacy technique of using a hidden iframe and the `authorization_code` grant with `prompt=none` is used.
   * The default setting is `false`.
   *
   * **Note**: Use of refresh tokens must be enabled by an administrator on your Auth client application.
   */
  useRefreshTokens?: boolean;

  /**
   * If true, fallback to the technique of using a hidden iframe and the `authorization_code` grant with `prompt=none` when unable to use refresh tokens. If false, the iframe fallback is not used and
   * errors relating to a failed `refresh_token` grant should be handled appropriately. The default setting is `false`.
   *
   * **Note**: There might be situations where doing silent auth with a Web Message response from an iframe is not possible,
   * like when you're serving your application from the file system or a custom protocol (like in a Desktop or Native app).
   * In situations like this you can disable the iframe fallback and handle the failed `refresh_token` grant and prompt the user to login interactively with `loginWithRedirect` or `loginWithPopup`."
   *
   * E.g. Using the `file:` protocol in an Electron application does not support that legacy technique.
   *
   * @example
   * let token: string;
   * try {
   *   token = await auth0.getTokenSilently();
   * } catch (e) {
   *   if (e.error === 'missing_refresh_token' || e.error === 'invalid_grant') {
   *     auth0.loginWithRedirect();
   *   }
   * }
   */
  useRefreshTokensFallback?: boolean;

  /**
   * If true, data to the token endpoint is transmitted as x-www-form-urlencoded data, if false it will be transmitted as JSON. The default setting is `true`.
   *
   * **Note:** Setting this to `false` may affect you if you use Auth0 Rules and are sending custom, non-primitive data. If you disable this,
   * please verify that your Auth0 Rules continue to work as intended.
   */
  useFormData?: boolean;

  /**
   * Modify the value used as the current time during the token validation.
   *
   * **Note**: Using this improperly can potentially compromise the token validation.
   */
  nowProvider?: () => Promise<number> | number;

  /**
   *
   */
  fetcher?: Fetcher;

  openUrl?: (url: string) => Promise<void> | void;
}

// Need to align with the OIDC extraParams settings in core
export type InteractionMode = 'signIn' | 'signUp';

/**
 * @ignore
 */
export interface AuthorizeOptions extends AuthorizationParams {
  redirect_uri?: string;
  client_id: string;
  ts: number;
  client_challenge?: string;
  client_challenge_method?: string;
}

export interface UrlOpenProvider {
  /**
   * Used to control the redirect and not rely on the SDK to do the actual redirect.
   *
   * @example
   * const client = new AuthClient({
   *   openUrl(url) {
   *     window.location.replace(url);
   *   }
   * });
   *
   * @example
   * import { Browser } from '@capacitor/browser';
   *
   * const client = new AuthClient({
   *   async openUrl(url) {
   *     await Browser.open({ url });
   *   }
   * });
   */
  openUrl?: (url: string) => Promise<void> | void;
}

export interface RedirectLoginOptions<TAppState = any> extends OptionsWithAuthorizationParams, UrlOpenProvider {
  /**
   * Used to store state before doing the redirect
   */
  appState?: TAppState;

  /**
   * Used to add to the URL fragment before redirecting
   */
  fragment?: string;
}

export interface LogoutUrlOptions {
  /**
   * The `clientId` of your application.
   *
   * If this property is not set, then the `clientId` that was used during initialization of the SDK is sent to the logout endpoint.
   *
   * If this property is set to `null`, then no client ID value is sent to the logout endpoint.
   *
   * [Read more about how redirecting after logout works](https://auth0.com/docs/logout/guides/redirect-users-after-logout)
   */
  clientId?: string | null;
}

export interface LogoutOptions extends LogoutUrlOptions {
  /**
   * Used to control the redirect and not rely on the SDK to do the actual redirect.
   *
   * Set to `false` to disable the redirect, or provide a function to handle the actual redirect yourself.
   *
   * @example
   * await auth0.logout({
   *   openUrl(url) {
   *     window.location.replace(url);
   *   }
   * });
   *
   * @example
   * import { Browser } from '@capacitor/browser';
   *
   * await auth0.logout({
   *   async openUrl(url) {
   *     await Browser.open({ url });
   *   }
   * });
   */
  openUrl?: false | ((url: string) => Promise<void> | void);
}

export interface LogoutEndpointOptions {
  url: string;
  accessToken: string;
  refreshToken?: string;
  timeout?: number;
}

export interface GetTokenSilentlyOptions {
  /**
   * When `off`, ignores the cache and always sends a
   * request to Auth.
   * When `cache-only`, only reads from the cache and never sends a request to Auth.
   * Defaults to `on`, where it both reads from the cache and sends a request to Auth as needed.
   */
  cacheMode?: 'on' | 'off' | 'cache-only';

  /**
   * Parameters that will be sent back to Auth as part of a request.
   */
  authorizationParams?: {
    /**
     * There's no actual redirect when getting a token silently,
     * but, according to the spec, a `redirect_uri` param is required.
     * Auth uses this parameter to validate that the current `origin`
     * matches the `redirect_uri` `origin` when sending the response.
     * It must be whitelisted in the "Allowed Web Origins" in your
     * Auth Application's settings.
     */
    redirect_uri?: string;

    /**
     * If you need to send custom parameters to the Authorization Server,
     * make sure to use the original parameter name.
     */
    [key: string]: any;
  };

  /** A maximum number of seconds to wait before declaring the background /authorize call as failed for timeout
   * Defaults to 60s.
   */
  timeoutInSeconds?: number;

  /**
   * If true, the full response from the /oauth/token endpoint (or the cache, if the cache was used) is returned
   * (minus `refresh_token` if one was issued). Otherwise, just the access token is returned.
   *
   * The default is `false`.
   */
  detailedResponse?: boolean;
}

/**
 * @ignore
 */
export interface JWTVerifyOptions {
  iss: string;
  aud: string;
  token: string;
  max_age?: number;
  now?: number;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  name?: string;
  photoUrl?: string;
  tenantId?: string;
  userTenantId?: string;
  status?: string;
  role?: string;
  age?: number;
  permissions?: string[];
  userPreferences?: {
    locale?: string;
    [key: string]: any;
  };
}

/**
 * @ignore
 */
export interface AuthenticationResult {
  // state: string;
  code?: string;
  error?: string;
  error_description?: string;
}

export const enum TokenGrantType {
  AuthorizationCode,
  RefreshToken,
}

interface BaseRequestTokenOptions {
  // audience?: string;
  // scope: string;
  timeout?: number;
  // redirect_uri?: string;
}

export interface CodeRequestTokenOptions extends BaseRequestTokenOptions {
  clientId: string;
  code: string;
  // code_verifier: string;
}

export interface RefreshTokenRequestTokenOptions extends BaseRequestTokenOptions {
  refreshToken: string;
}

export interface TokenEndpointBaseOptions extends BaseRequestTokenOptions {
  baseUrl: string;
  authClient?: Record<string, any>;
  useFormData?: boolean;

  [key: string]: any;
}

/**
 * @ignore
 */
export type TokenEndpointOptions = TokenEndpointBaseOptions &
  (CodeRequestTokenOptions | RefreshTokenRequestTokenOptions);

export type TokenEndpointResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

export type LogoutEndpointResponse = {
  success: boolean;
  key: string;
  logoutUrl?: string;
};
