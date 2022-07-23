import { act, RenderHookResult, waitFor } from '@testing-library/react';
import type { DocumentNode } from 'graphql';
import { CombinedError, makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import {
  CrudProps,
  HookCallOptions,
  useNetWorthCategoryCrud,
  useNetWorthEntryCrud,
  useNetWorthSubcategoryCrud,
} from './crud';

import * as NetWorthMutations from '~client/gql/mutations/net-worth';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import type { NetWorthEntryNative } from '~client/types';
import { NetWorthCategoryType, RequestType } from '~client/types/enum';
import type { NetWorthCategoryInput, NetWorthSubcategoryInput } from '~client/types/gql';

describe('generic crud hooks', () => {
  let mutateSpy: jest.SpyInstance;
  beforeEach(() => {
    mutateSpy = jest.spyOn(mockClient, 'executeMutation').mockImplementation((request) =>
      fromValue({
        operation: makeOperation('mutation', request, {} as OperationContext),
        data: null,
      }),
    );
  });

  type TestCase<T extends Record<string, unknown>> = {
    testId: number;
    useHook: (options?: HookCallOptions) => CrudProps<T>;
    createInput: Record<string, unknown>;
    updateInput: Record<string, unknown>;
    expectedArgsCreate: Record<string, unknown>;
    expectedArgsUpdate: Record<string, unknown>;
    mutationCreate: DocumentNode;
    mutationUpdate: DocumentNode;
    mutationDelete: DocumentNode;
  };

  const testCaseNetWorthCategory: TestCase<NetWorthCategoryInput> = {
    testId: 1239,
    useHook: useNetWorthCategoryCrud,
    createInput: {
      category: 'My net worth category',
      type: NetWorthCategoryType.Asset,
      isOption: false,
      color: 'green',
    },
    expectedArgsCreate: {
      input: {
        category: 'My net worth category',
        type: NetWorthCategoryType.Asset,
        isOption: false,
        color: 'green',
      },
    },
    updateInput: {
      category: 'My net worth option',
      type: NetWorthCategoryType.Asset,
      isOption: true,
      color: 'darkgreen',
    },
    expectedArgsUpdate: {
      id: 1239,
      input: {
        category: 'My net worth option',
        type: NetWorthCategoryType.Asset,
        isOption: true,
        color: 'darkgreen',
      },
    },
    mutationCreate: NetWorthMutations.CreateNetWorthCategory,
    mutationUpdate: NetWorthMutations.UpdateNetWorthCategory,
    mutationDelete: NetWorthMutations.DeleteNetWorthCategory,
  };

  const testCaseNetWorthSubcategory: TestCase<NetWorthSubcategoryInput> = {
    testId: 1237,
    useHook: useNetWorthSubcategoryCrud,
    createInput: {
      subcategory: 'My net worth subcategory',
      isSAYE: null,
      opacity: 0.37,
    },
    expectedArgsCreate: {
      input: {
        subcategory: 'My net worth subcategory',
        isSAYE: null,
        opacity: 0.37,
      },
    },
    updateInput: {
      subcategory: 'My net worth SAYE option subcategory',
      isSAYE: true,
      opacity: 0.93,
    },
    expectedArgsUpdate: {
      id: 1237,
      input: {
        subcategory: 'My net worth SAYE option subcategory',
        isSAYE: true,
        opacity: 0.93,
      },
    },
    mutationCreate: NetWorthMutations.CreateNetWorthSubcategory,
    mutationUpdate: NetWorthMutations.UpdateNetWorthSubcategory,
    mutationDelete: NetWorthMutations.DeleteNetWorthSubcategory,
  };

  const testCaseNetWorthEntry: TestCase<NetWorthEntryNative> = {
    testId: 1240,
    useHook: useNetWorthEntryCrud,
    createInput: {
      date: new Date('2020-05-29'),
      values: [
        { subcategory: 1, value: 0, simple: 6721903 },
        { subcategory: 32, value: 0, simple: -16745 },
        { subcategory: 20, value: 0, fx: [{ currency: 'CZK', value: 193 }] },
        {
          subcategory: 13,
          value: 0,
          option: { units: 105, vested: 93, strikePrice: 78.65, marketPrice: 119.23 },
        },
        {
          subcategory: 47,
          value: 0,
          mortgage: { principal: 187505, paymentsRemaining: 123, rate: 2.74 },
        },
      ],
      creditLimit: [{ subcategory: 32, value: 150000 }],
      currencies: [{ currency: 'CZK', rate: 0.02673 }],
    },
    expectedArgsCreate: {
      input: {
        date: '2020-05-29',
        values: [
          { subcategory: 1, simple: 6721903 },
          { subcategory: 32, simple: -16745 },
          { subcategory: 20, fx: [{ currency: 'CZK', value: 193 }] },
          {
            subcategory: 13,
            option: { units: 105, vested: 93, strikePrice: 78.65, marketPrice: 119.23 },
          },
          { subcategory: 47, mortgage: { principal: 187505, paymentsRemaining: 123, rate: 2.74 } },
        ],
        creditLimit: [{ subcategory: 32, value: 150000 }],
        currencies: [{ currency: 'CZK', rate: 0.02673 }],
      },
    },
    updateInput: {
      date: new Date('2020-05-27'),
      values: [
        { subcategory: 1, value: 0, simple: 5378820 },
        { subcategory: 32, value: 0, simple: -20785 },
        { subcategory: 20, value: 0, fx: [{ currency: 'USD', value: 207 }] },
        {
          subcategory: 13,
          value: 0,
          option: { units: 105, vested: 97, strikePrice: 78.65, marketPrice: 112.32 },
        },
        {
          subcategory: 47,
          value: 0,
          mortgage: { principal: 193050, paymentsRemaining: 122, rate: 2.74 },
        },
      ],
      creditLimit: [{ subcategory: 32, value: 125000 }],
      currencies: [{ currency: 'USD', rate: 0.74612 }],
    },
    expectedArgsUpdate: {
      id: 1240,
      input: {
        date: '2020-05-27',
        values: [
          { subcategory: 1, simple: 5378820 },
          { subcategory: 32, simple: -20785 },
          { subcategory: 20, fx: [{ currency: 'USD', value: 207 }] },
          {
            subcategory: 13,
            option: { units: 105, vested: 97, strikePrice: 78.65, marketPrice: 112.32 },
          },
          { subcategory: 47, mortgage: { principal: 193050, paymentsRemaining: 122, rate: 2.74 } },
        ],
        creditLimit: [{ subcategory: 32, value: 125000 }],
        currencies: [{ currency: 'USD', rate: 0.74612 }],
      },
    },
    mutationCreate: NetWorthMutations.CreateNetWorthEntry,
    mutationUpdate: NetWorthMutations.UpdateNetWorthEntry,
    mutationDelete: NetWorthMutations.DeleteNetWorthEntry,
  };

  const onError = jest.fn();

  describe.each`
    name                               | testCase
    ${useNetWorthCategoryCrud.name}    | ${testCaseNetWorthCategory}
    ${useNetWorthSubcategoryCrud.name} | ${testCaseNetWorthSubcategory}
    ${useNetWorthEntryCrud.name}       | ${testCaseNetWorthEntry}
  `('$name', ({ testCase }: { testCase: TestCase<Record<string, unknown>> }) => {
    const setup = (): RenderHookResult<
      CrudProps<Record<string, unknown>>,
      Partial<HookCallOptions>
    > => renderHookWithStore(() => testCase.useHook({ onError }));

    describe('creating', () => {
      it('should call the correct mutation', async () => {
        expect.assertions(2);
        const { result } = setup();
        act(() => {
          result.current.onCreate(testCase.createInput);
        });

        await waitFor(() => {
          expect(mutateSpy).toHaveBeenCalledTimes(1);
          expect(mutateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              query: testCase.mutationCreate,
              variables: testCase.expectedArgsCreate,
            }),
            expect.objectContaining({}),
          );
        });
      });

      describe('when an error occurs', () => {
        it('should call onError', async () => {
          expect.hasAssertions();
          const testError = new CombinedError({
            networkError: new Error('something bad happened!'),
          });

          mutateSpy.mockReturnValueOnce(
            fromValue({
              error: testError,
            }),
          );

          const { result } = setup();
          act(() => {
            result.current.onCreate(testCase.createInput);
          });

          await waitFor(() => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(testError.message, RequestType.create);
          });
        });
      });
    });

    describe('updating', () => {
      it('should call the correct mutation', async () => {
        expect.assertions(2);
        const { result } = setup();
        act(() => {
          result.current.onUpdate(testCase.testId, testCase.updateInput);
        });

        await waitFor(() => {
          expect(mutateSpy).toHaveBeenCalledTimes(1);
          expect(mutateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              query: testCase.mutationUpdate,
              variables: testCase.expectedArgsUpdate,
            }),
            expect.objectContaining({}),
          );
        });
      });

      describe('when an error occurs', () => {
        it('should call onError', async () => {
          expect.hasAssertions();
          const testError = new CombinedError({
            networkError: new Error('something nasty happened!'),
          });

          mutateSpy.mockReturnValueOnce(
            fromValue({
              error: testError,
            }),
          );

          const { result } = setup();
          act(() => {
            result.current.onUpdate(testCase.testId, testCase.updateInput);
          });

          await waitFor(() => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(testError.message, RequestType.update);
          });
        });
      });
    });

    describe('deleting', () => {
      it('should call the correct mutation', async () => {
        expect.assertions(2);
        const { result } = setup();
        act(() => {
          result.current.onDelete(testCase.testId);
        });

        await waitFor(() => {
          expect(mutateSpy).toHaveBeenCalledTimes(1);
          expect(mutateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              query: testCase.mutationDelete,
              variables: {
                id: testCase.testId,
              },
            }),
            expect.objectContaining({}),
          );
        });
      });

      describe('when an error occurs', () => {
        it('should call onError', async () => {
          expect.hasAssertions();
          const testError = new CombinedError({
            networkError: new Error('something ugly happened!'),
          });

          mutateSpy.mockReturnValueOnce(
            fromValue({
              error: testError,
            }),
          );

          const { result } = setup();
          act(() => {
            result.current.onDelete(testCase.testId);
          });

          await waitFor(() => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(testError.message, RequestType.delete);
          });
        });
      });
    });
  });
});
