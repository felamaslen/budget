import { waitFor } from '@testing-library/react';
import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';
import { GraphQLRequest, makeOperation, OperationContext, OperationResult } from 'urql';
import { delay, fromValue, pipe } from 'wonka';

import { initialState } from '../context';
import { usePlanning } from './sync';

import { GQLProviderMock, mockClient } from '~client/test-utils/gql-provider-mock';
import {
  MutationSyncPlanningArgs,
  PlanningAccount,
  PlanningParameters,
  PlanningSyncResponse,
  SyncPlanningDocument,
  SyncPlanningMutation,
} from '~client/types/gql';

describe(usePlanning.name, () => {
  const Wrapper: React.FC = ({ children }) => (
    <GQLProviderMock client={mockClient}>{children}</GQLProviderMock>
  );
  const localYear = 2020;
  const usePlanningWithYear = (): ReturnType<typeof usePlanning> => usePlanning(localYear);

  const mockSyncResponse: PlanningSyncResponse = {
    __typename: 'PlanningSyncResponse',
    error: null,
    year: 2020,
    accounts: [
      {
        __typename: 'PlanningAccount',
        id: 178,
        netWorthSubcategoryId: 85,
        account: 'My account',
        income: [
          {
            __typename: 'PlanningIncome',
            id: 18,
            salary: 8500000,
            taxCode: '818L',
            startDate: '2020-06-05',
            endDate: '2021-03-31',
            pensionContrib: 0.03,
            studentLoan: true,
          },
        ],
        creditCards: [
          {
            __typename: 'PlanningCreditCard',
            id: 72,
            netWorthSubcategoryId: 30,
            payments: [
              {
                __typename: 'PlanningCreditCardPayment',
                id: 1991,
                month: 4,
                value: -56192,
              },
            ],
            predictedPayment: 11063,
          },
        ],
        values: [
          {
            __typename: 'PlanningValue',
            id: 67,
            month: 7,
            value: null,
            formula: '=45*29',
            name: 'Some purchase',
          },
        ],
        computedValues: [
          {
            __typename: 'PlanningComputedValue',
            key: 'salary-predicted-2020-12',
            name: 'Salary',
            month: 11,
            value: 708333,
            isTransfer: false,
            isVerified: false,
          },
        ],
        computedStartValue: 88389,
      },
    ],
    parameters: {
      __typename: 'PlanningParameters',
      rates: [{ __typename: 'TaxRate', name: 'My rate', value: 0.28 }],
      thresholds: [{ __typename: 'TaxThreshold', name: 'My threshold', value: 20100 }],
    },
  };

  let mutateSpy: jest.SpyInstance;
  beforeEach(() => {
    mutateSpy = jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) =>
      fromValue<OperationResult<SyncPlanningMutation>>({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: {
          __typename: 'Mutation',
          syncPlanning: mockSyncResponse,
        },
      }),
    );
  });

  it('should return the initial state', () => {
    expect.assertions(1);
    const { result, unmount } = renderHook(usePlanningWithYear, { wrapper: Wrapper });
    expect(result.current.state).toStrictEqual(initialState);

    unmount();
  });

  it('should initially set isSynced=false, isLoading=true', () => {
    expect.assertions(2);
    const { result, unmount } = renderHook(usePlanningWithYear, { wrapper: Wrapper });

    expect(result.current.isSynced).toBe(false);
    expect(result.current.isLoading).toBe(true);

    unmount();
  });

  it('should sync state on render', async () => {
    expect.assertions(15);

    const { result, waitForNextUpdate } = renderHook(usePlanningWithYear, { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    expect(mutateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: SyncPlanningDocument,
        variables: {
          year: localYear,
        },
      }),
      {},
    );

    expect(result.current.state.accounts).not.toHaveLength(0);
    expect(result.current.state.parameters.rates).not.toHaveLength(0);
    expect(result.current.state.parameters.thresholds).not.toHaveLength(0);

    expect(result.current.state.accounts).toHaveLength(1);

    expect(result.current.state.accounts[0].id).toMatchInlineSnapshot(`178`);
    expect(result.current.state.accounts[0].account).toMatchInlineSnapshot(`"My account"`);
    expect(result.current.state.accounts[0].netWorthSubcategoryId).toMatchInlineSnapshot(`85`);

    expect(result.current.state.accounts[0].income).toMatchInlineSnapshot(`
      Array [
        Object {
          "endDate": "2021-03-31",
          "id": 18,
          "pensionContrib": 0.03,
          "salary": 8500000,
          "startDate": "2020-06-05",
          "studentLoan": true,
          "taxCode": "818L",
        },
      ]
    `);
    expect(result.current.state.accounts[0].values).toMatchInlineSnapshot(`
      Array [
        Object {
          "formula": "=45*29",
          "id": 67,
          "month": 7,
          "name": "Some purchase",
          "value": null,
        },
      ]
    `);
    expect(result.current.state.accounts[0].creditCards).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 72,
          "netWorthSubcategoryId": 30,
          "payments": Array [
            Object {
              "id": 1991,
              "month": 4,
              "value": -56192,
            },
          ],
          "predictedPayment": 11063,
        },
      ]
    `);

    expect(result.current.state.accounts[0].computedStartValue).toMatchInlineSnapshot(`88389`);
    expect(result.current.state.accounts[0].computedValues).toMatchInlineSnapshot(`
      Array [
        Object {
          "isTransfer": false,
          "isVerified": false,
          "key": "salary-predicted-2020-12",
          "month": 11,
          "name": "Salary",
          "value": 708333,
        },
      ]
    `);

    expect(result.current.state.parameters).toMatchInlineSnapshot(`
      Object {
        "rates": Array [
          Object {
            "name": "My rate",
            "value": 0.28,
          },
        ],
        "thresholds": Array [
          Object {
            "name": "My threshold",
            "value": 20100,
          },
        ],
      }
    `);
  });

  describe('when calling setState', () => {
    const renderAndUpdateState = async (): Promise<
      RenderHookResult<never, ReturnType<typeof usePlanning>>
    > => {
      const renderHookResult = renderHook(usePlanningWithYear, { wrapper: Wrapper });
      await renderHookResult.waitForNextUpdate();

      jest.useFakeTimers();

      act(() => {
        renderHookResult.result.current.setState((last) => ({
          ...last,
          accounts: [
            { ...last.accounts[0], account: 'My modified account' },
            {
              netWorthSubcategoryId: 29,
              account: 'New account',
              income: [],
              creditCards: [],
              values: [],
              computedValues: [],
            },
          ],
        }));
      });

      act(() => {
        renderHookResult.result.current.setState((last) => ({
          ...last,
          parameters: {
            ...last.parameters,
            rates: [...last.parameters.rates, { name: 'Another rate', value: 0.3 }],
          },
        }));
      });

      mutateSpy.mockImplementationOnce((request) =>
        fromValue<OperationResult<SyncPlanningMutation>>({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: {
            __typename: 'Mutation',
            syncPlanning: {
              ...mockSyncResponse,
              parameters: {
                ...(mockSyncResponse.parameters as PlanningParameters),
                rates: [
                  ...(mockSyncResponse.parameters?.rates ?? []),
                  { name: 'Another rate', value: 0.3 },
                ],
              },
              accounts: [
                {
                  ...(mockSyncResponse.accounts?.[0] as PlanningAccount),
                  account: 'My modified account',
                },
                {
                  __typename: 'PlanningAccount',
                  id: 8881,
                  netWorthSubcategoryId: 29,
                  account: 'New account',
                  income: [],
                  creditCards: [],
                  values: [],
                  computedValues: [],
                },
              ],
            },
          },
        }),
      );

      mutateSpy.mockClear();

      return renderHookResult;
    };

    it('should run a debounced mutation with the updated state', async () => {
      expect.assertions(3);
      const { unmount } = await renderAndUpdateState();

      expect(mutateSpy).not.toHaveBeenCalled();

      act(() => {
        jest.runAllTimers();
      });

      expect(mutateSpy).toHaveBeenCalledTimes(1);
      expect(mutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          query: SyncPlanningDocument,
          variables: {
            year: localYear,
            input: {
              accounts: [
                {
                  id: 178,
                  netWorthSubcategoryId: 85,
                  account: 'My modified account',
                  income: [
                    {
                      id: 18,
                      salary: 8500000,
                      taxCode: '818L',
                      startDate: '2020-06-05',
                      endDate: '2021-03-31',
                      pensionContrib: 0.03,
                      studentLoan: true,
                    },
                  ],
                  creditCards: [
                    {
                      id: 72,
                      netWorthSubcategoryId: 30,
                      payments: [
                        {
                          id: 1991,
                          month: 4,
                          value: -56192,
                        },
                      ],
                    },
                  ],
                  values: [
                    {
                      id: 67,
                      month: 7,
                      value: null,
                      formula: '=45*29',
                      name: 'Some purchase',
                    },
                  ],
                },
                {
                  netWorthSubcategoryId: 29,
                  account: 'New account',
                  income: [],
                  creditCards: [],
                  values: [],
                },
              ],
              parameters: {
                rates: [
                  { name: 'My rate', value: 0.28 },
                  { name: 'Another rate', value: 0.3 },
                ],
                thresholds: [{ name: 'My threshold', value: 20100 }],
              },
            },
          },
        }),
        {},
      );

      jest.useRealTimers();
      unmount();
    });

    it('should set the synced and loading statuses before, during and after loading', async () => {
      expect.assertions(5);

      const { result, waitForNextUpdate, unmount } = await renderAndUpdateState();

      expect(result.current.isSynced).toBe(false);
      expect(result.current.isLoading).toBe(false);

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.isLoading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSynced).toBe(true);

      jest.useRealTimers();
      unmount();
    });

    it('should update the state optimistically', async () => {
      expect.assertions(5);
      const { result } = await renderAndUpdateState();

      expect(result.current.state.accounts).toHaveLength(2);

      expect(result.current.state.accounts[0].account).toBe('My modified account');
      expect(result.current.state.accounts[1].id).toBeUndefined();

      expect(result.current.state.parameters.rates).toHaveLength(2);
      expect(result.current.state.parameters.rates).toMatchInlineSnapshot(`
        Array [
          Object {
            "name": "My rate",
            "value": 0.28,
          },
          Object {
            "name": "Another rate",
            "value": 0.3,
          },
        ]
      `);
    });

    it('should backfill the state after syncing', async () => {
      expect.assertions(3);
      const { result, unmount, waitForNextUpdate } = await renderAndUpdateState();
      act(() => {
        jest.runAllTimers();
      });
      await waitForNextUpdate();

      expect(result.current.state.accounts).toHaveLength(2);
      expect(result.current.state.accounts[1].id).toBe(8881);

      expect(result.current.state.parameters.rates).toHaveLength(2);

      jest.useRealTimers();
      unmount();
    });
  });

  describe('when changing the year', () => {
    const renderAndChangeYear = async (): Promise<
      RenderHookResult<{ year: number }, ReturnType<typeof usePlanning>>
    > => {
      const hookResult = renderHook<{ year: number }, ReturnType<typeof usePlanning>>(
        (props) => usePlanning(props.year),
        { wrapper: Wrapper, initialProps: { year: 2020 } },
      );

      await hookResult.waitForNextUpdate();

      await act(async () => {
        hookResult.rerender({ year: 2023 });
        await hookResult.waitForNextUpdate();
      });

      return hookResult;
    };

    it('should sync the latest state', async () => {
      expect.assertions(3);

      await renderAndChangeYear();

      expect(mutateSpy).toHaveBeenCalledTimes(2);

      expect(mutateSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          query: SyncPlanningDocument,
          variables: {
            year: 2020,
          },
        }),
        {},
      );

      expect(mutateSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          query: SyncPlanningDocument,
          variables: {
            year: 2023,
          },
        }),
        {},
      );
    });

    it('should not initiate a sync of the local state until it changes', async () => {
      expect.assertions(3);
      const { result, waitForNextUpdate } = await renderAndChangeYear();
      expect(mutateSpy).toHaveBeenCalledTimes(2);

      act(() => {
        result.current.setState((last) => ({
          ...last,
          accounts: [
            {
              ...last.accounts[0],
              account: 'Updated account',
            },
            ...last.accounts.slice(1),
          ],
        }));
      });

      await waitForNextUpdate();

      expect(mutateSpy).toHaveBeenCalledTimes(3);
      expect(mutateSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          query: SyncPlanningDocument,
          variables: {
            year: 2023,
            input: expect.objectContaining({
              accounts: expect.arrayContaining([
                expect.objectContaining({
                  id: 178,
                  account: 'Updated account',
                }),
              ]),
            }),
          },
        }),
        {},
      );
    });

    it('should not accept synced data from a previous sync with a different year', async () => {
      expect.hasAssertions();
      // Render hook in old year (2020)
      const { rerender, result, waitForNextUpdate } = renderHook<
        { year: number },
        ReturnType<typeof usePlanning>
      >((props) => usePlanning(props.year), { wrapper: Wrapper, initialProps: { year: 2020 } });

      await waitForNextUpdate();

      // Mock responses in order
      mutateSpy.mockImplementation(
        (request: GraphQLRequest<PlanningSyncResponse, MutationSyncPlanningArgs>) => {
          if (request.variables?.year === 2020) {
            return pipe(
              fromValue<OperationResult<SyncPlanningMutation>>({
                operation: makeOperation('mutation', request, {} as OperationContext),
                data: {
                  __typename: 'Mutation',
                  syncPlanning: {
                    ...mockSyncResponse,
                    parameters: {
                      ...(mockSyncResponse.parameters as PlanningParameters),
                      rates: [
                        ...(mockSyncResponse.parameters?.rates ?? []),
                        { name: 'Another rate', value: 0.3 },
                      ],
                    },
                    accounts: [
                      {
                        ...(mockSyncResponse.accounts?.[0] as PlanningAccount),
                        account: 'My modified account',
                      },
                      {
                        __typename: 'PlanningAccount',
                        id: 8881,
                        netWorthSubcategoryId: 29,
                        account: 'New account',
                        income: [],
                        creditCards: [],
                        values: [],
                        computedValues: [],
                      },
                    ],
                  },
                },
              }),
              delay(150),
            );
          }
          return pipe(
            fromValue<OperationResult<SyncPlanningMutation>>({
              operation: makeOperation('mutation', request, {} as OperationContext),
              data: {
                __typename: 'Mutation',
                syncPlanning: {
                  year: 2023,
                  parameters: {
                    rates: [],
                    thresholds: [],
                  },
                  accounts: [
                    {
                      __typename: 'PlanningAccount',
                      id: 1291,
                      netWorthSubcategoryId: 102,
                      account: 'Some other account',
                      income: [],
                      creditCards: [],
                      values: [],
                      computedValues: [],
                    },
                  ],
                },
              },
            }),
            delay(50),
          );
        },
      );

      // Mutate old year
      act(() => {
        result.current.setState((last) => ({
          ...last,
          accounts: [
            {
              ...last.accounts[0],
              account: 'Updated account',
            },
            ...last.accounts.slice(1),
          ],
        }));
      });

      // Rerender hook with new year (2023)
      await act(async () => {
        rerender({ year: 2023 });
        await waitForNextUpdate();
      });

      await waitFor(() => {
        expect(result.current.state.year).toBe(2023);
        expect(result.current.state.accounts).toHaveLength(1);
      });

      await act(async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
      });

      // Assert that the slower response of the old (2020) request got ignored
      expect(result.current.state.year).toBe(2023);
      expect(result.current.state.accounts).toHaveLength(1);
    });
  });

  describe('when an error occurs', () => {
    const renderAndUpdateWithError = async (): Promise<
      RenderHookResult<never, ReturnType<typeof usePlanning>>
    > => {
      const renderHookResult = renderHook(usePlanningWithYear, { wrapper: Wrapper });
      await renderHookResult.waitForNextUpdate();

      jest.useFakeTimers();

      mutateSpy.mockImplementationOnce((request) =>
        fromValue<OperationResult<SyncPlanningMutation>>({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: {
            __typename: 'Mutation',
            syncPlanning: {
              __typename: 'PlanningSyncResponse',
              error: 'Some error occurred',
              year: null,
              accounts: null,
              parameters: null,
              taxReliefFromPreviousYear: null,
            },
          },
        }),
      );

      mutateSpy.mockClear();

      act(() => {
        renderHookResult.result.current.setState((last) => ({
          ...last,
          accounts: [{ ...last.accounts[0], account: 'My modified account' }],
        }));
      });

      return renderHookResult;
    };

    it('should set the error property', async () => {
      expect.assertions(1);
      const { result, unmount, waitForNextUpdate } = await renderAndUpdateWithError();

      act(() => {
        jest.runAllTimers();
      });
      await waitForNextUpdate();

      expect(result.current.error).toBe('Some error occurred');
      unmount();
    });

    it('should reset to the previous synced state', async () => {
      expect.assertions(2);
      const { result, unmount, waitForNextUpdate } = await renderAndUpdateWithError();

      expect(result.current.state.accounts[0].account).toBe('My modified account');

      act(() => {
        jest.runAllTimers();
      });
      await waitForNextUpdate();

      expect(result.current.state.accounts[0].account).toBe('My account');
      unmount();
    });

    it('should set isSynced=true, isLoading=false', async () => {
      expect.assertions(2);
      const { result, unmount, waitForNextUpdate } = await renderAndUpdateWithError();

      act(() => {
        jest.runAllTimers();
      });
      await waitForNextUpdate();

      expect(result.current.isSynced).toBe(true);
      expect(result.current.isLoading).toBe(false);
      unmount();
    });

    it('should resend a request when the state changes again', async () => {
      expect.assertions(4);
      const { result, unmount, waitForNextUpdate } = await renderAndUpdateWithError();
      act(() => {
        jest.runAllTimers();
      });
      await waitForNextUpdate();

      mutateSpy.mockClear();

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.setState((last) => ({
          ...last,
          accounts: [{ ...last.accounts[0], account: 'account-changed-again' }],
        }));
      });

      expect(mutateSpy).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();

      act(() => {
        jest.runAllTimers();
      });
      expect(mutateSpy).toHaveBeenCalledTimes(1);

      unmount();
    });
  });
});
