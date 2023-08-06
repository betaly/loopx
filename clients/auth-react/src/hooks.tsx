import {type InteractionMode, type User} from '@loopx/auth-browser';
import {useCallback, useContext, useEffect, useRef} from 'react';

import {LoopAuthContext, throwContextError} from './context';

type LoopAuth = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
  fetchUserInfo: () => Promise<User | undefined>;
  getAccessToken: () => Promise<string | undefined>;
  loginWithRedirect: (redirectUri: string, interactionMode?: InteractionMode) => Promise<void>;
  logout: () => Promise<void>;
};

const useLoadingState = () => {
  const {loadingCount, setLoadingCount} = useContext(LoopAuthContext);
  const isLoading = loadingCount > 0;

  const setLoadingState = useCallback(
    (state: boolean) => {
      if (state) {
        setLoadingCount(count => count + 1);
      } else {
        setLoadingCount(count => Math.max(0, count - 1));
      }
    },
    [setLoadingCount],
  );

  return {isLoading, setLoadingState};
};

const useErrorHandler = () => {
  const {setError} = useContext(LoopAuthContext);

  const handleError = useCallback(
    (error: unknown, fallbackErrorMessage?: string) => {
      if (error instanceof Error) {
        setError(error);
      } else if (fallbackErrorMessage) {
        setError(new Error(fallbackErrorMessage));
      }
      console.error(error);
    },
    [setError],
  );

  return {handleError};
};

const useHandleRedirectCallback = (callback?: () => void) => {
  const {client, isAuthenticated, error, setIsAuthenticated} = useContext(LoopAuthContext);
  const {isLoading, setLoadingState} = useLoadingState();
  const {handleError} = useErrorHandler();
  const callbackRef = useRef<() => void>();

  useEffect(() => {
    callbackRef.current = callback; // Update ref to the latest callback.
  }, [callback]);

  const handleRedirectCallback = useCallback(
    async (callbackUri: string) => {
      if (!client) {
        return throwContextError();
      }

      try {
        setLoadingState(true);
        await client.handleRedirectCallback(callbackUri);
        setIsAuthenticated(true);
        callbackRef.current?.();
      } catch (err: unknown) {
        handleError(err, 'Unexpected error occurred while handling sign in callback.');
      } finally {
        setLoadingState(false);
      }
    },
    [client, setLoadingState, setIsAuthenticated, handleError],
  );

  useEffect(() => {
    const currentPageUrl = window.location.href;

    if (!isAuthenticated && client?.isLoginRedirected(currentPageUrl)) {
      // eslint-disable-next-line no-void
      void handleRedirectCallback(currentPageUrl);
    }
  }, [handleRedirectCallback, isAuthenticated, client]);

  return {
    isLoading,
    isAuthenticated,
    error,
  };
};

const useLoopAuth = (): LoopAuth => {
  const {client, loadingCount, isAuthenticated, error} = useContext(LoopAuthContext);
  const {setLoadingState} = useLoadingState();
  const {handleError} = useErrorHandler();

  const isLoading = loadingCount > 0;

  const loginWithRedirect = useCallback(
    async (redirectUri: string, interactionMode?: InteractionMode) => {
      if (!client) {
        return throwContextError();
      }

      try {
        setLoadingState(true);

        await client.loginWithRedirect({
          authorizationParams: {
            redirect_uri: redirectUri,
            interaction_mode: interactionMode,
          },
        });
      } catch (err: unknown) {
        handleError(err, 'Unexpected error occurred while logging in.');
      }
    },
    [client, setLoadingState, handleError],
  );

  const logout = useCallback(async () => {
    if (!client) {
      return throwContextError();
    }

    try {
      setLoadingState(true);

      await client.logout();

      // We deliberately do NOT set isAuthenticated to false here, because the app state may change immediately
      // even before navigating to the oidc end session endpoint, which might cause rendering problems.
      // Moreover, since the location will be redirected, the isAuthenticated state will not matter any more.
    } catch (err: unknown) {
      handleError(err, 'Unexpected error occurred while signing out.');
    } finally {
      setLoadingState(false);
    }
  }, [client, setLoadingState, handleError]);

  const fetchUserInfo = useCallback(async () => {
    if (!client) {
      return throwContextError();
    }

    try {
      setLoadingState(true);

      return await client.getUser();
    } catch (err: unknown) {
      handleError(err, 'Unexpected error occurred while fetching user info.');
    } finally {
      setLoadingState(false);
    }
  }, [client, setLoadingState, handleError]);

  const getAccessToken = useCallback(async () => {
    if (!client) {
      return throwContextError();
    }

    try {
      setLoadingState(true);

      return await client.getTokenSilently();
    } catch (err: unknown) {
      handleError(err, 'Unexpected error occurred while getting access token.');
    } finally {
      setLoadingState(false);
    }
  }, [client, setLoadingState, handleError]);

  if (!client) {
    return throwContextError();
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    fetchUserInfo,
    getAccessToken,
  };
};

export {useLoopAuth, useHandleRedirectCallback};
