import { waitFor } from '@testing-library/react';
import numericHash from 'string-hash';
import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import { useIncomeItems } from './income';

import { listDataReceived } from '~client/actions';
import { ReadIncome } from '~client/gql/queries/list';
import { mockClient, renderHookWithStore } from '~client/test-utils';
import { PageListStandard, ReadIncomeQuery } from '~client/types/gql';

describe(useIncomeItems.name, () => {
  const mockIncome: ReadIncomeQuery = {
    readIncome: {
      items: [
        {
          id: numericHash('my-id'),
          date: '2020-04-20',
          item: 'Salary',
          cost: 708333,
          category: 'Work',
          shop: 'My company',
          deductions: [
            { name: 'Tax', value: -186520 },
            { name: 'NI', value: -43302 },
          ],
        },
      ],
      olderExists: true,
      weekly: 168230,
      total: 30056239,
      totalDeductions: [
        { name: 'Tax', value: -4562230 },
        { name: 'NI', value: -1563920 },
      ],
    },
  };

  beforeEach(() => {
    jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
      if (request.query === ReadIncome) {
        return fromValue({
          operation: makeOperation('query', request, {} as OperationContext),
          data: mockIncome,
        });
      }
      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: null,
      });
    });
  });

  it('should add the deductions to the dispatched data received action', async () => {
    expect.hasAssertions();

    const { store } = renderHookWithStore(useIncomeItems);

    await waitFor(() => {
      expect(store.getActions()).toHaveLength(1);
    });

    expect(store.getActions()).toStrictEqual([
      listDataReceived(
        PageListStandard.Income,
        mockIncome.readIncome as NonNullable<ReadIncomeQuery['readIncome']>,
        {
          totalDeductions: [
            { name: 'Tax', value: -4562230 },
            { name: 'NI', value: -1563920 },
          ],
        },
      ),
    ]);
  });
});
