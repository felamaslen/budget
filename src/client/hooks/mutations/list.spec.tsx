import { act, RenderHookResult, waitFor } from '@testing-library/react';
import type { MockStore } from 'redux-mock-store';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { useListCrudStandard, useListCrudFunds, useListCrudIncome, ListCrud } from './list';
import {
  errorOpened,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  apiLoaded,
  apiLoading,
} from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as dataModule from '~client/modules/data';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import type {
  FundInputNative as FundInput,
  FundInputNative,
  StandardInput,
  WithIds,
} from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import {
  CreateIncomeDocument,
  DeleteIncomeDocument,
  Income,
  IncomeDeductionInput,
  IncomeInput,
  MutationCreateIncomeArgs,
  MutationUpdateIncomeArgs,
  UpdateIncomeDocument,
} from '~client/types/gql';
import { NativeDate } from '~shared/types';

jest.mock('shortid', () => ({
  generate: (): string => 'my-short-id',
}));

describe('list mutations', () => {
  beforeEach(() => {
    jest.spyOn(dataModule, 'generateFakeId').mockReturnValue(numericHash('some-fake-id'));
  });

  const page = PageListStandard.Income;

  const testId = numericHash('some-real-id');

  const testItem: WithIds<StandardInput> = {
    id: 129,
    date: new Date('2020-04-20'),
    item: 'Some item',
    cost: 341,
    category: 'Some category',
    shop: 'Some shop',
  };

  const testDelta: Partial<StandardInput> = {
    item: 'Other item',
  };

  describe(useListCrudStandard.name, () => {
    const setup = (): RenderHookResult<ListCrud<StandardInput>, { page: PageListStandard }> & {
      store: MockStore;
    } => renderHookWithStore(() => useListCrudStandard(page));

    describe('onCreate', () => {
      it('should dispatch an optimistic create action', async () => {
        expect.hasAssertions();

        jest.spyOn(mockClient, 'executeMutation').mockImplementationOnce((request) =>
          fromValue({
            operation: makeOperation('mutation', request, {} as OperationContext),
            data: {
              createListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onCreate(testItem);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemCreated(page, testItem, false, numericHash('some-fake-id')),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.hasAssertions();

          (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
            fromValue({
              data: {
                createListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, result } = setup();
          expect(store.getActions()).toHaveLength(0);

          act(() => {
            result.current.onCreate(testItem);
          });

          await waitFor(() => {
            expect(store.getActions()).toStrictEqual(
              expect.arrayContaining([
                errorOpened(`Error creating list item: Something bad happened`, ErrorLevel.Warn),
              ]),
            );
          });
        });
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onUpdate(testId, testDelta, testItem);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemUpdated(page, numericHash('some-real-id'), testDelta, testItem, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.hasAssertions();

          jest.spyOn(mockClient, 'executeMutation').mockImplementationOnce((request) =>
            fromValue({
              operation: makeOperation('mutation', request, {} as OperationContext),
              data: {
                updateListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, result } = setup();
          expect(store.getActions()).toHaveLength(0);
          act(() => {
            result.current.onUpdate(testId, testDelta, testItem);
          });

          await waitFor(() => {
            expect(store.getActions()).toStrictEqual(
              expect.arrayContaining([
                errorOpened(`Error updating list item: Something bad happened`, ErrorLevel.Warn),
              ]),
            );
          });
        });
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateListItem: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onDelete(testId, testItem);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemDeleted(page, numericHash('some-real-id'), testItem, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      describe('when an error occurs', () => {
        it('should dispatch an error action', async () => {
          expect.hasAssertions();

          jest.spyOn(mockClient, 'executeMutation').mockImplementationOnce((request) =>
            fromValue({
              operation: makeOperation('mutation', request, {} as OperationContext),
              data: {
                deleteListItem: {
                  error: 'Something bad happened',
                },
              },
            }),
          );

          const { store, result } = setup();
          expect(store.getActions()).toHaveLength(0);
          act(() => {
            result.current.onDelete(testId, testItem);
          });

          await waitFor(() => {
            expect(store.getActions()).toStrictEqual(
              expect.arrayContaining([
                errorOpened(`Error deleting list item: Something bad happened`, ErrorLevel.Warn),
              ]),
            );
          });
        });
      });
    });
  });

  describe(useListCrudIncome.name, () => {
    const setup = (): RenderHookResult<
      ListCrud<NativeDate<Income, 'date'>>,
      Record<string, unknown>
    > & {
      store: MockStore;
    } => renderHookWithStore(useListCrudIncome);

    const testIncome: NativeDate<Income, 'date'> = {
      __typename: 'Income',
      id: 129,
      date: new Date('2020-04-20'),
      item: 'Salary',
      cost: 708333,
      category: 'Work',
      shop: 'Some company',
      deductions: [{ __typename: 'IncomeDeduction', name: 'Income tax', value: -195030 }],
    };

    const testIncomeDelta: Partial<NativeDate<IncomeInput, 'date'>> = {
      item: 'Different salary',
      deductions: [
        {
          __typename: 'IncomeDeduction',
          name: 'Income tax',
          value: -195030,
        } as IncomeDeductionInput,
        { __typename: 'IncomeDeduction', name: 'SAYE', value: -50000 } as IncomeDeductionInput,
      ],
    };

    describe('onCreate', () => {
      beforeEach(() => {
        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              createFund: {
                error: null,
              },
            },
          }),
        );
      });

      it('should dispatch an optimistic create action', async () => {
        expect.hasAssertions();

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onCreate(testIncome);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemCreated(
              PageListStandard.Income,
              testIncome,
              false,
              numericHash('some-fake-id'),
            ),
            apiLoading,
            apiLoaded,
          ]);
        });

        expect(mockClient.executeMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            query: CreateIncomeDocument,
            variables: expect.objectContaining<MutationCreateIncomeArgs>({
              fakeId: expect.any(Number),
              input: {
                date: '2020-04-20',
                item: 'Salary',
                cost: 708333,
                category: 'Work',
                shop: 'Some company',
                deductions: [{ name: 'Income tax', value: -195030 }],
              },
            }),
          }),
          expect.anything(),
        );
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateFund: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onUpdate(testId, testIncomeDelta, testIncome);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemUpdated<NativeDate<Income, 'date'>>(
              PageListStandard.Income,
              testId,
              testIncomeDelta,
              testIncome,
              false,
            ),
            apiLoading,
            apiLoaded,
          ]);
        });

        expect(mockClient.executeMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            query: UpdateIncomeDocument,
            variables: expect.objectContaining<MutationUpdateIncomeArgs>({
              id: testId,
              input: {
                date: '2020-04-20',
                item: 'Different salary',
                cost: 708333,
                category: 'Work',
                shop: 'Some company',
                deductions: [
                  { name: 'Income tax', value: -195030 },
                  { name: 'SAYE', value: -50000 },
                ],
              },
            }),
          }),
          expect.anything(),
        );
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              deleteFund: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onDelete(testId, testIncome);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemDeleted(PageListStandard.Income, testId, testIncome, false),
            apiLoading,
            apiLoaded,
          ]);
        });

        expect(mockClient.executeMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            query: DeleteIncomeDocument,
          }),
          expect.anything(),
        );
      });
    });
  });

  describe(useListCrudFunds.name, () => {
    const setup = (): RenderHookResult<ListCrud<FundInputNative>, Record<string, unknown>> & {
      store: MockStore;
    } => renderHookWithStore(useListCrudFunds);

    const testFund: WithIds<FundInput> = {
      id: 123,
      item: 'Some fund',
      allocationTarget: 40,
      transactions: [],
      stockSplits: [],
    };

    const testFundDelta: Partial<FundInput> = {
      transactions: [
        {
          date: new Date('2020-04-03'),
          units: 154.28,
          price: 99.13,
          fees: 132,
          taxes: 19,
          drip: false,
          pension: false,
        },
      ],
      stockSplits: [{ date: new Date('2021-03-01'), ratio: 10 }],
    };

    describe('onCreate', () => {
      beforeEach(() => {
        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              createFund: {
                error: null,
              },
            },
          }),
        );
      });

      it('should dispatch an optimistic create action', async () => {
        expect.hasAssertions();

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onCreate(testFund);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemCreated(PageNonStandard.Funds, testFund, false, numericHash('some-fake-id')),
            apiLoading,
            apiLoaded,
          ]);
        });
      });

      it('should pass the right variables into the mutation', async () => {
        expect.hasAssertions();

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onCreate(testFund);
        });

        await waitFor(() => {
          expect(mockClient.executeMutation).toHaveBeenCalledTimes(1);
        });

        expect(mockClient.executeMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            variables: expect.objectContaining({
              fakeId: expect.any(Number),
              input: testFund,
            }),
          }),
          expect.anything(),
        );
      });
    });

    describe('onUpdate', () => {
      it('should dispatch an optimistic update action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              updateFund: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onUpdate(testId, testFundDelta, testFund);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemUpdated(PageNonStandard.Funds, testId, testFundDelta, testFund, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });
    });

    describe('onDelete', () => {
      it('should dispatch an optimistic delete action', async () => {
        expect.hasAssertions();

        (mockClient.executeMutation as jest.Mock).mockReturnValueOnce(
          fromValue({
            data: {
              deleteFund: {
                error: null,
              },
            },
          }),
        );

        const { store, result } = setup();
        expect(store.getActions()).toHaveLength(0);
        act(() => {
          result.current.onDelete(testId, testFund);
        });

        await waitFor(() => {
          expect(store.getActions()).toStrictEqual([
            listItemDeleted(PageNonStandard.Funds, testId, testFund, false),
            apiLoading,
            apiLoaded,
          ]);
        });
      });
    });
  });
});
