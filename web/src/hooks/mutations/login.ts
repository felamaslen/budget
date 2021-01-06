import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useLoginMutation } from '../gql';
import { errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';

type State = {
  pin: number | null;
  apiKey: string | null;
};

export function useLogin(): {
  login: (pin: number) => void;
  loading: boolean;
  loggedIn: boolean;
  apiKey: string | null;
} {
  const dispatch = useDispatch();

  const [{ data, fetching, error }, request] = useLoginMutation();

  const apiKeyResult = data?.login.apiKey ?? null;

  const [{ pin, apiKey }, setState] = useState<State>({ pin: null, apiKey: apiKeyResult });

  const login = useCallback((newPin: number) => setState((last) => ({ ...last, pin: newPin })), []);

  const loggedIn = !!apiKey;

  useEffect(() => {
    setState((last) => ({ ...last, apiKey: apiKeyResult }));
  }, [apiKeyResult]);

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

  return {
    login,
    loading: fetching,
    loggedIn,
    apiKey: data?.login?.apiKey ?? null,
  };
}
