import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useLoginMutation } from '../gql';
import { configUpdatedFromApi, errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import { useConfigQuery } from '~client/types/gql';

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

  const [loginResult, requestLogin] = useLoginMutation();
  const [configResult, requestConfig] = useConfigQuery({ pause: true });

  const apiKeyResult = loginResult.data?.login.apiKey ?? null;

  const [{ pin, apiKey }, setState] = useState<State>({ pin: null, apiKey: apiKeyResult });

  const login = useCallback((newPin: number) => setState((last) => ({ ...last, pin: newPin })), []);

  const loggedIn = !!apiKey;
  const hasConfig = !configResult.fetching && !!configResult.data?.config;

  useEffect(() => {
    setState((last) => ({ ...last, apiKey: apiKeyResult }));
  }, [apiKeyResult]);

  const error = loginResult.error ?? configResult.error;

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(error.message, ErrorLevel.Fatal));
    }
  }, [dispatch, error]);

  const loginError = loginResult.data?.login?.error;
  useEffect(() => {
    if (loginError) {
      dispatch(errorOpened(loginError, ErrorLevel.Warn));
    }
  }, [dispatch, loginError]);

  useEffect(() => {
    if (pin) {
      requestLogin({ pin });
    }
  }, [pin, requestLogin]);

  useEffect(() => {
    if (loggedIn) {
      requestConfig();
    }
  }, [loggedIn, requestConfig]);

  useEffect(() => {
    if (!configResult.fetching && configResult.data?.config) {
      dispatch(configUpdatedFromApi(configResult.data.config));
    }
  }, [configResult, dispatch, pin, requestLogin]);

  return {
    login,
    loading: loginResult.fetching || configResult.fetching,
    loggedIn: loggedIn && hasConfig,
    apiKey: loginResult.data?.login?.apiKey ?? null,
  };
}
