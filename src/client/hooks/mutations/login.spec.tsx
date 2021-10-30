import { waitFor } from '@testing-library/react';
import { act, RenderHookResult } from '@testing-library/react-hooks';
import type { MockStore } from 'redux-mock-store';
import { makeOperation, OperationContext } from 'urql';
import { delay, fromValue, pipe } from 'wonka';

import { useLogin } from './login';
import { configUpdatedFromApi, errorOpened } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as LoginMutations from '~client/gql/mutations/login';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import * as types from '~client/types/gql';

jest.mock('shortid', () => ({
  generate: (): string => 'my-short-id',
}));

describe(useLogin.name, () => {
  let mutationSpy: jest.SpyInstance;
  let querySpy: jest.SpyInstance;

  const myCorrectPin = 1235;

  const mockConfig: types.ConfigQuery = {
    __typename: 'Query',
    config: {
      __typename: 'AppConfig',
      birthDate: '1992-03-15',
      realTimePrices: true,
      futureMonths: 5,
    },
  };

  beforeEach(() => {
    mutationSpy = jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) => {
      if (request.query === LoginMutations.login) {
        if ((request.variables as types.MutationLoginArgs).pin === myCorrectPin) {
          return pipe(
            fromValue({
              operation: makeOperation('mutation', request, {} as OperationContext),
              data: {
                login: {
                  error: null,
                  uid: 1,
                  name: 'Someone',
                  apiKey: 'some-api-key',
                },
              },
            }),
            delay(2),
          );
        }
        return pipe(
          fromValue({
            operation: makeOperation('mutation', request, {} as OperationContext),
            data: {
              login: {
                error: 'Incorrect PIN',
                uid: null,
                name: null,
                apiKey: null,
              },
            },
          }),
          delay(2),
        );
      }
      return fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: null,
      });
    });

    querySpy = jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === types.ConfigDocument) {
        return pipe(
          fromValue({
            operation: makeOperation('query', request, {} as OperationContext),
            data: mockConfig,
          }),
          delay(10),
        );
      }
      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should set loading to false initially', () => {
    expect.assertions(1);
    const { result } = renderHookWithStore(useLogin);

    expect(result.current.loading).toBe(false);
  });

  describe('when logging in', () => {
    const setupLogin = (
      pin: number,
    ): RenderHookResult<never, ReturnType<typeof useLogin>> & { store: MockStore } => {
      const renderHookResult = renderHookWithStore(useLogin);

      act(() => {
        renderHookResult.result.current.login(pin);
      });

      return renderHookResult;
    };

    describe('prior to the response being returned', () => {
      it('should return loggedIn = false, loading = true', () => {
        expect.assertions(2);
        const { result } = setupLogin(myCorrectPin);

        expect(result.current.loggedIn).toBe(false);
        expect(result.current.loading).toBe(true);
      });
    });

    describe('after successful login', () => {
      it('should return loggedIn = true, loading = false', async () => {
        expect.hasAssertions();
        const { result } = setupLogin(myCorrectPin);

        await waitFor(() => {
          expect(result.current.loggedIn).toBe(true);
          expect(result.current.loading).toBe(false);
        });
      });

      it('should call the login mutation once', async () => {
        expect.hasAssertions();
        setupLogin(myCorrectPin);

        await waitFor(() => {
          expect(mutationSpy).toHaveBeenCalledTimes(1);
        });

        expect(mutationSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            query: LoginMutations.login,
            variables: {
              pin: 1235,
            },
          }),
          {},
        );
      });

      it('should query and set the app config after the login mutation', async () => {
        expect.hasAssertions();

        const { result, store } = setupLogin(myCorrectPin);

        expect(mutationSpy).toHaveBeenCalledTimes(1);
        expect(querySpy).not.toHaveBeenCalled();

        expect(result.current.loggedIn).toBe(false);
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
          expect(querySpy).toHaveBeenCalledTimes(1);
        });

        expect(querySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            query: types.ConfigDocument,
          }),
          {},
        );

        expect(store.getActions()).toStrictEqual([
          configUpdatedFromApi(mockConfig.config as types.AppConfig),
        ]);

        expect(result.current.loggedIn).toBe(true);
        expect(result.current.loading).toBe(false);
      });

      it('should return the API key', async () => {
        expect.hasAssertions();
        const { result } = setupLogin(myCorrectPin);

        await waitFor(() => {
          expect(result.current.apiKey).toBe('some-api-key');
        });
      });
    });

    describe('after a failed login', () => {
      it('should set loggedIn = false, loading = false', async () => {
        expect.hasAssertions();
        const { result } = setupLogin(myCorrectPin - 1);

        await waitFor(() => {
          expect(result.current.loggedIn).toBe(false);
          expect(result.current.loading).toBe(false);
        });
      });

      it('should set the API key to null', async () => {
        expect.assertions(1);
        const { result } = setupLogin(myCorrectPin - 1);

        await waitFor(() => {
          expect(result.current.apiKey).toBeNull();
        });
      });

      it('should dispatch an error action', async () => {
        expect.hasAssertions();
        const { store } = setupLogin(myCorrectPin - 1);

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual(
            expect.arrayContaining([errorOpened('Incorrect PIN', ErrorLevel.Warn)]),
          );
        });
      });
    });
  });
});
