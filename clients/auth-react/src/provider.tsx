import AuthClient, {type AuthClientOptions} from '@loopx/auth-browser';
import React, {type ReactNode, useEffect, useMemo, useState} from 'react';

import {MicroAuthContext} from './context';

export type MicroAuthProviderProps = {
  client: AuthClient | AuthClientOptions;
  children?: ReactNode;
};

export const MicroAuthProvider = ({client: clientOrConfig, children}: MicroAuthProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error>();
  const client = useMemo(
    () => (isAuthClient(clientOrConfig) ? clientOrConfig : new AuthClient(clientOrConfig)),
    [clientOrConfig],
  );

  useEffect(() => {
    (async () => {
      const authenticated = await client.isAuthenticated();

      setIsAuthenticated(authenticated);
      setLoadingCount(count => Math.max(0, count - 1));
    })();
  }, [client]);

  const contextValue = useMemo(
    () => ({
      client,
      isAuthenticated,
      setIsAuthenticated,
      loadingCount,
      setLoadingCount,
      error,
      setError,
    }),
    [client, isAuthenticated, loadingCount, error],
  );

  return <MicroAuthContext.Provider value={contextValue}>{children}</MicroAuthContext.Provider>;
};

function isAuthClient(x: unknown): x is AuthClient {
  return !!x && typeof x === 'object' && typeof (x as AuthClient).loginWithRedirect === 'function';
}
