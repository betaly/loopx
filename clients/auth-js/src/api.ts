import {urlSafeBase64} from './base64';
import {DEFAULT_AUTH_CLIENT} from './constants';
import {fetchJson} from './fetch';
import {
  Fetcher,
  LogoutEndpointOptions,
  LogoutEndpointResponse,
  TokenEndpointOptions,
  TokenEndpointResponse,
} from './types';
import {createFormParams} from './utils';

export async function fetchToken(
  {baseUrl, useFormData, timeout, authClient, ...options}: TokenEndpointOptions,
  fetcher?: Fetcher,
) {
  if (!options.code && !options.refreshToken) {
    throw new Error('Missing code or refreshToken');
  }

  const body = useFormData ? createFormParams(options) : JSON.stringify(options);

  const url = options.code ? `${baseUrl}/auth/token` : `${baseUrl}/auth/token-refresh`;
  const contentType = useFormData ? 'application/x-www-form-urlencoded' : 'application/json';

  return fetchJson<TokenEndpointResponse>(
    url,
    {
      method: 'POST',
      body,
      headers: {
        'Content-Type': contentType,
        'Auth-Client': urlSafeBase64.encode(JSON.stringify(authClient || DEFAULT_AUTH_CLIENT)),
      },
      timeout,
    },
    fetcher,
  );
}

export async function postLogout({url, accessToken, refreshToken, timeout}: LogoutEndpointOptions, fetcher?: Fetcher) {
  const body = JSON.stringify({
    refreshToken,
  });

  return fetchJson<LogoutEndpointResponse>(
    url,
    {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      timeout,
    },
    fetcher,
  );
}
