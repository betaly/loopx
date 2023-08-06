import {type AuthClient} from '@loopx/auth-browser';
import React, {createContext} from 'react';

export type MicroAuthContextProps = {
  client?: AuthClient;
  isAuthenticated: boolean;
  loadingCount: number;
  error?: Error;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <MicroAuthProvider> context.');
};

export const MicroAuthContext = createContext<MicroAuthContextProps>({
  client: undefined,
  isAuthenticated: false,
  loadingCount: 0,
  error: undefined,
  setIsAuthenticated: throwContextError,
  setLoadingCount: throwContextError,
  setError: throwContextError,
});
