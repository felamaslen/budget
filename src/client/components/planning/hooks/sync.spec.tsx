import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import React from 'react';
import { makeOperation, OperationContext, OperationResult } from 'urql';
import { fromValue } from 'wonka';

import { initialState } from '../context';
import { usePlanning } from './sync';

import { GQLProviderMock, mockClient } from '~client/test-utils/gql-provider-mock';
import {
  PlanningAccount,
  PlanningParameters,
  PlanningSyncResponse,
  SyncPlanningDocument,
  SyncPlanningMutation,
  TaxRate,
} from '~client/types/gql';

describe(usePlanning.name, () => {
  const Wrapper: React.FC = ({ children }) => (
    <GQLProviderMock client={mockClient}>{children}</GQLProviderMock>
  );

  const mockSyncResponse: PlanningSyncResponse = {
    __typename: 'PlanningSyncResponse',
    error: null,
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
            startDate: '2021-06-05',
            endDate: '2022-03-31',
            pensionContrib: 0.03,
            studentLoan: true,
          },
        ],
        pastIncome: [
          {
            __typename: 'PlanningPastIncome',
            date: '2021-04-25',
            gross: 550000,
            deductions: [{ __typename: 'IncomeDeduction', name: 'Tax', value: -104542 }],
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
                year: 2021,
                month: 4,
                value: -56192,
              },
            ],
          },
        ],
        values: [
          {
            __typename: 'PlanningValue',
            id: 67,
            year: 2021,
            month: 7,
            value: null,
            formula: '=45*29',
            name: 'Some purchase',
          },
        ],
      },
    ],
    parameters: [
      {
        __typename: 'PlanningParameters',
        year: 2020,
        rates: [{ __typename: 'TaxRate', name: 'My rate', value: 0.28 }],
        thresholds: [{ __typename: 'TaxThreshold', name: 'My threshold', value: 20100 }],
      },
    ],
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
    const { result, unmount } = renderHook(usePlanning, { wrapper: Wrapper });
    expect(result.current.state).toStrictEqual(initialState);

    unmount();
  });

  it('should initially set isSynced=false, isLoading=true', () => {
    expect.assertions(2);
    const { result, unmount } = renderHook(usePlanning, { wrapper: Wrapper });

    expect(result.current.isSynced).toBe(false);
    expect(result.current.isLoading).toBe(true);

    unmount();
  });

  it('should sync state on render', async () => {
    expect.assertions(5);

    const { result, waitForNextUpdate } = renderHook(usePlanning, { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    expect(mutateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        query: SyncPlanningDocument,
        variables: {},
      }),
      {},
    );

    expect(result.current.state.accounts).not.toHaveLength(0);
    expect(result.current.state.parameters).not.toHaveLength(0);
    expect(result.current.state).toMatchInlineSnapshot(`
      Object {
        "accounts": Array [
          Object {
            "account": "My account",
            "creditCards": Array [
              Object {
                "id": 72,
                "netWorthSubcategoryId": 30,
                "payments": Array [
                  Object {
                    "id": 1991,
                    "month": 4,
                    "value": -56192,
                    "year": 2021,
                  },
                ],
              },
            ],
            "id": 178,
            "income": Array [
              Object {
                "endDate": "2022-03-31",
                "id": 18,
                "pensionContrib": 0.03,
                "salary": 8500000,
                "startDate": "2021-06-05",
                "studentLoan": true,
                "taxCode": "818L",
              },
            ],
            "netWorthSubcategoryId": 85,
            "pastIncome": Array [
              Object {
                "date": "2021-04-25",
                "deductions": Array [
                  Object {
                    "name": "Tax",
                    "value": -104542,
                  },
                ],
                "gross": 550000,
              },
            ],
            "values": Array [
              Object {
                "formula": "=45*29",
                "id": 67,
                "month": 7,
                "name": "Some purchase",
                "value": null,
                "year": 2021,
              },
            ],
          },
        ],
        "parameters": Array [
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
            "year": 2020,
          },
        ],
      }
    `);
  });

  describe('when calling setState', () => {
    const renderAndUpdateState = async (): Promise<
      RenderHookResult<never, ReturnType<typeof usePlanning>>
    > => {
      const renderHookResult = renderHook(usePlanning, { wrapper: Wrapper });
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
              pastIncome: [],
              creditCards: [],
              values: [],
            },
          ],
        }));
      });

      act(() => {
        renderHookResult.result.current.setState((last) => ({
          ...last,
          parameters: [
            {
              ...last.parameters[0],
              rates: [...last.parameters[0].rates, { name: 'Another rate', value: 0.3 }],
            },
          ],
        }));
      });

      mutateSpy.mockImplementationOnce((request) =>
        fromValue<OperationResult<SyncPlanningMutation>>({
          operation: makeOperation('mutation', request, {} as OperationContext),
          data: {
            __typename: 'Mutation',
            syncPlanning: {
              ...mockSyncResponse,
              parameters: [
                {
                  ...(mockSyncResponse.parameters?.[0] as PlanningParameters),
                  rates: [
                    ...(mockSyncResponse.parameters?.[0]?.rates as TaxRate[]),
                    { name: 'Another rate', value: 0.3 },
                  ],
                },
              ],
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
                  pastIncome: [],
                  creditCards: [],
                  values: [],
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
      const { result, unmount } = await renderAndUpdateState();

      expect(mutateSpy).not.toHaveBeenCalled();

      act(() => {
        jest.runAllTimers();
      });

      expect(mutateSpy).toHaveBeenCalledTimes(1);
      expect(mutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          query: SyncPlanningDocument,
          variables: {
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
                      startDate: '2021-06-05',
                      endDate: '2022-03-31',
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
                          year: 2021,
                          month: 4,
                          value: -56192,
                        },
                      ],
                    },
                  ],
                  values: [
                    {
                      id: 67,
                      year: 2021,
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
              parameters: [
                {
                  year: 2020,
                  rates: [
                    { name: 'My rate', value: 0.28 },
                    { name: 'Another rate', value: 0.3 },
                  ],
                  thresholds: [{ name: 'My threshold', value: 20100 }],
                },
              ],
            },
          },
        }),
        {},
      );

      act(() => {
        result.current.setState((last) => ({
          ...last,
          parameters: [
            {
              ...last.parameters[0],
              rates: [...last.parameters[0].rates, { name: 'Another rate', value: 0.3 }],
            },
          ],
        }));
      });

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

      expect(result.current.state.parameters[0].rates).toHaveLength(2);
      expect(result.current.state.parameters[0].rates).toMatchInlineSnapshot(`
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

      expect(result.current.state.parameters[0].rates).toHaveLength(2);

      jest.useRealTimers();
      unmount();
    });
  });

  describe('when an error occurs', () => {
    const renderAndUpdateWithError = async (): Promise<
      RenderHookResult<never, ReturnType<typeof usePlanning>>
    > => {
      const renderHookResult = renderHook(usePlanning, { wrapper: Wrapper });
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
              accounts: null,
              parameters: null,
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
