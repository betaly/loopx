import AuthClient from '@loopx/auth-browser';
import {act, renderHook, waitFor} from '@testing-library/react';
import React, {ReactNode} from 'react';

import {MicroAuthContext, type MicroAuthContextProps} from '../../context';
import {MicroAuthProvider} from '../../provider';

import {useHandleRedirectCallback, useMicroAuth} from '../..';

const isAuthenticated = jest.fn(() => false);
const isLoginRedirected = jest.fn(() => false);
const handleRedirectCallback = jest.fn().mockResolvedValue(undefined);
const getTokenSilently = jest.fn(() => {
  throw new Error('not authenticated');
});

const notImplemented = () => {
  throw new Error('Not implemented');
};

jest.mock('@loopx/auth-browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAuthenticated,
      isLoginRedirected,
      handleRedirectCallback,
      getTokenSilently,
      loginWithRedirect: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
    };
  });
});

const domain = 'https://auth.dev';
const clientId = 'foo';
const loginPath = '/login';
const logoutPath = '/logout';

const createHookWrapper =
  () =>
  ({children}: {children?: ReactNode}) =>
    <MicroAuthProvider client={{domain, clientId, loginPath, logoutPath}}>{children}</MicroAuthProvider>;

describe('useMicroAuth', () => {
  it('should throw without using context provider', () => {
    expect(() => renderHook(useMicroAuth)).toThrow();
  });

  it('should call AuthClient constructor on init', async () => {
    await act(async () => {
      renderHook(useMicroAuth, {
        wrapper: createHookWrapper(),
      });
    });

    expect(AuthClient).toHaveBeenCalledWith({domain, clientId, loginPath, logoutPath});
  });

  it('should return AuthClient property methods', async () => {
    const {result} = renderHook(useMicroAuth, {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      const {loginWithRedirect, logout, fetchUserInfo, getAccessToken, error} = result.current;

      expect(error).toBeUndefined();
      expect(loginWithRedirect).not.toBeUndefined();
      expect(logout).not.toBeUndefined();
      expect(fetchUserInfo).not.toBeUndefined();
      expect(getAccessToken).not.toBeUndefined();
    });
  });

  it('should not call `handleRedirectCallback` when it is not in callback url', async () => {
    await act(async () => {
      renderHook(useHandleRedirectCallback, {
        wrapper: createHookWrapper(),
      });
    });
    expect(handleRedirectCallback).not.toHaveBeenCalled();
  });

  it('should not call `handleRedirectCallback` when it is authenticated', async () => {
    const mockClient = new AuthClient({domain, clientId, loginPath, logoutPath});
    const mockContext: MicroAuthContextProps = {
      client: mockClient,
      isAuthenticated: true, // Mock this to true by default
      loadingCount: 1,
      setIsAuthenticated: notImplemented,
      setLoadingCount: notImplemented,
      setError: notImplemented,
    };

    isLoginRedirected.mockReturnValueOnce(true);
    isAuthenticated.mockReturnValueOnce(true);

    await act(async () => {
      renderHook(useHandleRedirectCallback, {
        wrapper: ({children}: {children?: ReactNode}) => (
          <MicroAuthContext.Provider value={mockContext}>{children}</MicroAuthContext.Provider>
        ),
      });
    });

    expect(handleRedirectCallback).not.toHaveBeenCalled();
  });

  it('should call `handleRedirectCallback` when navigated back to predefined callback url', async () => {
    isLoginRedirected.mockReturnValueOnce(true);

    const {result} = renderHook(useHandleRedirectCallback, {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(handleRedirectCallback).toHaveBeenCalledTimes(1);
    handleRedirectCallback.mockRestore();
  });

  it('should call `handleRedirectCallback` only once even if it fails internally', async () => {
    isLoginRedirected.mockReturnValueOnce(true);
    handleRedirectCallback.mockRejectedValueOnce(new Error('Oops'));

    const {result} = renderHook(useHandleRedirectCallback, {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(handleRedirectCallback).toHaveBeenCalledTimes(1);
  });

  it('should return error when getAccessToken fails', async () => {
    const {result} = renderHook(useMicroAuth, {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await result.current.getAccessToken();
    });
    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
      expect(result.current.error?.message).toBe('not authenticated');
    });
  });
});
