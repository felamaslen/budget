import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { useLoginMutation } from '~client/types/gql';

type State = {
  pin: number | null;
  apiKey: string | null;
};

export const persistentLoginKey = 'pin';

export function useLogin(): {
  login: (pin: number) => void;
  loading: boolean;
  initialLoading: boolean;
  loggedIn: boolean;
  apiKey: string | null;
} {
  const dispatch = useDispatch();

  const [{ data, fetching, error }, request] = useLoginMutation();

  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const apiKeyResult = data?.login.apiKey ?? null;

  const [{ pin, apiKey }, setState] = useState<State>({ pin: null, apiKey: apiKeyResult });

  const login = useCallback((newPin: number) => setState((last) => ({ ...last, pin: newPin })), []);

  const loggedIn = !!apiKey;
  const attemptedLogin = useRef<boolean>(false);

  useEffect(() => {
    setState((last) => ({ ...last, apiKey: apiKeyResult }));
  }, [apiKeyResult]);

  useEffect(() => {
    if (apiKey && pin) {
      localStorage.setItem(persistentLoginKey, JSON.stringify(pin));
    }
  }, [apiKey, pin]);

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(error.message, ErrorLevel.Fatal));
    }
  }, [dispatch, error]);

  const loginError = data?.login?.error;
  useEffect(() => {
    if (loginError) {
      dispatch(errorOpened(loginError, ErrorLevel.Warn));
    }
  }, [dispatch, loginError]);

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
      const pinFromStorage = localStorage.getItem(persistentLoginKey);
      const validPin = (pinFromStorage && Number(JSON.parse(pinFromStorage))) || 0;

      if (validPin) {
        login(validPin);
        attemptedLogin.current = true;
      } else {
        setInitialLoading(false);
      }
    } catch {
      localStorage.removeItem(persistentLoginKey);
      setInitialLoading(false);
    }
  }, [loggedIn, login, dispatch]);

  return {
    login,
    loading: fetching,
    initialLoading,
    loggedIn,
    apiKey: data?.login?.apiKey ?? null,
  };
}
