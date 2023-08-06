import {type AuthClient} from '@loopx/auth-browser';
import React, {createContext} from 'react';

export type LoopAuthContextProps = {
  client?: AuthClient;
  isAuthenticated: boolean;
  loadingCount: number;
  error?: Error;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingCount: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
};

export const throwContextError = (): never => {
  throw new Error('Must be used inside <LoopAuthProvider> context.');
};

export const LoopAuthContext = createContext<LoopAuthContextProps>({
  client: undefined,
  isAuthenticated: false,
  loadingCount: 0,
  error: undefined,
  setIsAuthenticated: throwContextError,
  setLoadingCount: throwContextError,
  setError: throwContextError,
});
