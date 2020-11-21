import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { loggedOut, errorOpened, apiKeySet } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { useLoginMutation, LoginResponse } from '~client/types';

type State = {
  pin: number | null;
  apiKey: string | null;
};

export function useLogin(): {
  login: (pin: number) => void;
  logout: () => void;
  loading: boolean;
  error?: string;
  loggedIn: boolean;
  user?: LoginResponse;
} {
  const dispatch = useDispatch();

  const [result, request] = useLoginMutation();

  const error = result.error?.message ?? result.data?.login?.error ?? undefined;
  const apiKeyResult = result.data?.login.apiKey ?? null;

  const [{ pin, apiKey }, setState] = useState<State>({ pin: null, apiKey: apiKeyResult });

  const login = useCallback((newPin: number) => setState((last) => ({ ...last, pin: newPin })), []);

  const logout = useCallback(() => {
    setState({ pin: null, apiKey: null });
  }, []);

  const loggedIn = !!apiKey;
  const attemptedLogin = useRef<boolean>(false);

  useEffect(() => {
    setState((last) => ({ ...last, apiKey: apiKeyResult }));
  }, [apiKeyResult]);

  useEffect(() => {
    if (apiKey) {
      dispatch(apiKeySet(apiKey));
    } else if (attemptedLogin.current) {
      dispatch(loggedOut());
    }
  }, [apiKey, dispatch]);

  useEffect(() => {
    if (apiKey && pin) {
      localStorage.setItem('pin', JSON.stringify(pin));
    }
  }, [apiKey, pin]);

  useEffect(() => {
    if (!loggedIn && attemptedLogin.current) {
      localStorage.removeItem('pin');
    }
  }, [loggedIn]);

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(error, ErrorLevel.Warn));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (pin) {
      request({ pin });
    }
  }, [pin, request]);

  useEffect(() => {
    if (loggedIn || attemptedLogin.current) {
      attemptedLogin.current = true;
      return;
    }

    try {
      const pinFromStorage = localStorage.getItem('pin');
      const validPin = (pinFromStorage && Number(JSON.parse(pinFromStorage))) || 0;

      if (validPin) {
        login(validPin);
        attemptedLogin.current = true;
      }
    } finally {
      if (!attemptedLogin.current) {
        attemptedLogin.current = true;
        logout();
        dispatch(loggedOut());
      }
    }
  }, [loggedIn, login, logout, dispatch]);

  return {
    login,
    logout,
    loading: result.fetching,
    error,
    loggedIn,
    user: result.data?.login,
  };
}
