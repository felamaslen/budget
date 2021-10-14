import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import getStore, { MockStore } from 'redux-mock-store';
import { OperationResult } from 'urql';

import { useLogin } from './login';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import * as types from '~client/types/gql';

describe('Login hook', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createStore = getStore<State>();

  const TestComponent: React.FC = () => {
    const { login, loading, loggedIn, apiKey } = useLogin();

    return (
      <div>
        <button data-testid="btn-login" onClick={(): void => login(1235)}>
          Login
        </button>
        <span data-testid="hook-result">
          {JSON.stringify({
            loading,
            loggedIn,
            apiKey,
          })}
        </span>
      </div>
    );
  };

  const setup = (
    renderOptions: Partial<RenderResult> = {},
    customStore?: MockStore<State>,
  ): RenderResult & { store: MockStore } => {
    const store = customStore ?? createStore(testState);

    const renderResult = render(
      <Provider store={store}>
        <GQLProviderMock>
          <TestComponent />
        </GQLProviderMock>
      </Provider>,
      renderOptions,
    );
    return { ...renderResult, store };
  };

  function assertProp<P extends keyof ReturnType<typeof useLogin>>(
    { getByTestId }: Pick<RenderResult, 'getByTestId'>,
    prop: P,
    expectedValue: ReturnType<typeof useLogin>[P],
  ): void {
    expect(JSON.parse(getByTestId('hook-result').innerHTML)).toStrictEqual(
      expect.objectContaining({
        [prop]: expectedValue,
      }),
    );
  }

  const mockRun = async (): Promise<
    OperationResult<types.LoginMutation, types.LoginMutationVariables>
  > => ({} as OperationResult<types.LoginMutation, types.LoginMutationVariables>);

  it.each`
    case              | loading
    ${'fetching'}     | ${true}
    ${'not fetching'} | ${false}
  `('should return the loading status when $case', ({ loading }) => {
    expect.assertions(1);

    jest.spyOn(types, 'useLoginMutation').mockReturnValue([
      {
        fetching: loading,
        stale: false,
      },
      mockRun,
    ]);

    const result = setup();

    assertProp(result, 'loading', loading);
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

      userEvent.click(renderResult.getByTestId('btn-login'));

      spy.mockRestore();

      return renderResult;
    };

    describe('prior to login', () => {
      it('should return loggedIn = false', () => {
        expect.assertions(1);

        const firstResult = setup();
        assertProp(firstResult, 'loggedIn', false);
      });
    });

    describe('after successful login', () => {
      it('should return loggedIn = true', () => {
        expect.assertions(1);

        const secondResult = setupLogin();
        assertProp(secondResult, 'loggedIn', true);
      });
    });
  });

  it('should return the API key', () => {
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

    const result = setup();
    assertProp(result, 'apiKey', 'some-api-key');
  });
});
