/* eslint-disable no-proto */
import { render, fireEvent, act, RenderResult } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import getStore, { MockStore } from 'redux-mock-store';
import { Provider as URQLProvider, OperationResult, createClient } from 'urql';

import { useLogin } from './login';
import { apiKeySet, loggedOut } from '~client/actions';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import * as types from '~client/types/gql';

describe('Login hook', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createStore = getStore<State>();

  const TestComponent: React.FC = () => {
    const { login, logout, loading, error, loggedIn, user } = useLogin();

    return (
      <div>
        <button data-testid="btn-login" onClick={(): void => login(1235)}>
          Login
        </button>
        <button data-testid="btn-logout" onClick={logout}>
          Log out
        </button>
        <span data-testid="hook-result">
          {JSON.stringify({
            loading,
            error,
            loggedIn,
            user,
          })}
        </span>
      </div>
    );
  };

  const setup = (
    renderOptions: Partial<RenderResult> = {},
    customStore?: MockStore<State>,
  ): RenderResult & { store: MockStore } => {
    const client = createClient({ url: '/graphql' });

    const store = customStore ?? createStore(testState);

    const renderResult = render(
      <Provider store={store}>
        <URQLProvider value={client}>
          <TestComponent />
        </URQLProvider>
      </Provider>,
      renderOptions,
    );
    return { ...renderResult, store };
  };

  const mockRun = async (): Promise<
    OperationResult<types.LoginMutation, types.LoginMutationVariables>
  > => ({} as OperationResult<types.LoginMutation, types.LoginMutationVariables>);

  it('should return the loading status', () => {
    expect.assertions(1);

    jest.spyOn(types, 'useLoginMutation').mockReturnValue([
      {
        fetching: true,
        stale: false,
      },
      mockRun,
    ]);

    const { getByTestId } = setup();

    expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
      expect.objectContaining({
        loading: true,
      }),
    );
  });

  it('should return the error status', () => {
    expect.assertions(1);

    jest.spyOn(types, 'useLoginMutation').mockReturnValue([
      {
        fetching: true,
        stale: false,
        error: {
          name: 'SomeErrorOccurred',
          message: 'Bad PIN',
          graphQLErrors: [],
        },
      },
      mockRun,
    ]);

    const { getByTestId } = setup();

    expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
      expect.objectContaining({
        error: 'Bad PIN',
      }),
    );
  });

  describe('when logging in', () => {
    const setupLogin = (): ReturnType<typeof setup> => {
      const spy = jest.spyOn(types, 'useLoginMutation').mockReturnValue([
        {
          fetching: true,
          stale: false,
          data: {
            login: {
              uid: 1,
              name: 'Someone',
              apiKey: 'some-api-key',
            },
          },
        },
        mockRun,
      ]);

      const renderResult = setup();

      act(() => {
        fireEvent.click(renderResult.getByTestId('btn-login'));
      });

      spy.mockRestore();

      return renderResult;
    };

    describe('prior to login', () => {
      it('should return loggedIn = false', () => {
        expect.assertions(1);

        const firstResult = setup();

        expect(JSON.parse(firstResult.getByTestId('hook-result').innerHTML)).toStrictEqual(
          expect.objectContaining({
            loggedIn: false,
          }),
        );
      });
    });

    describe('after successful login', () => {
      it('should return loggedIn = true', () => {
        expect.assertions(1);

        const secondResult = setupLogin();

        expect(JSON.parse(secondResult.getByTestId('hook-result').innerHTML)).toStrictEqual(
          expect.objectContaining({
            loggedIn: true,
          }),
        );
      });

      it('should save the pin', () => {
        expect.assertions(2);

        const setItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');
        setItemSpy.mockClear();

        setupLogin();

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith('pin', '1235');
      });

      it('should dispatch an action to save the API key', () => {
        expect.assertions(1);

        const { store } = setupLogin();

        expect(store.getActions()).toStrictEqual(
          expect.arrayContaining([apiKeySet('some-api-key')]),
        );
      });
    });
  });

  it('should return the user', () => {
    expect.assertions(1);

    jest.spyOn(types, 'useLoginMutation').mockReturnValue([
      {
        fetching: true,
        stale: false,
        data: {
          login: {
            uid: 1,
            name: 'Someone',
            apiKey: 'some-api-key',
          },
        },
      },
      mockRun,
    ]);

    const { getByTestId } = setup();

    expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
      expect.objectContaining({
        user: {
          uid: 1,
          name: 'Someone',
          apiKey: 'some-api-key',
        },
      }),
    );
  });

  describe('when logging out', () => {
    const setupLogout = (): ReturnType<typeof setup> => {
      jest.spyOn(types, 'useLoginMutation').mockReturnValue([
        {
          fetching: false,
          stale: false,
          data: {
            login: {
              uid: 1,
              name: 'Someone',
              apiKey: 'some-api-key',
            },
          },
        },
        mockRun,
      ]);

      const renderResult = setup();

      act(() => {
        fireEvent.click(renderResult.getByTestId('btn-login'));
      });

      renderResult.store.clearActions();

      act(() => {
        fireEvent.click(renderResult.getByTestId('btn-logout'));
      });

      return renderResult;
    };

    it('should clear the pin', () => {
      expect.assertions(2);

      const removeItemSpy = jest.spyOn(window.localStorage.__proto__, 'removeItem');
      removeItemSpy.mockClear();

      setupLogout();

      expect(removeItemSpy).toHaveBeenCalledTimes(1);
      expect(removeItemSpy).toHaveBeenCalledWith('pin');
    });

    it('should dispatch an action to clear the state', () => {
      expect.assertions(1);

      const { store } = setupLogout();

      expect(store.getActions()).toStrictEqual([loggedOut()]);
    });
  });
});
