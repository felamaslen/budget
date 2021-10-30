import { makeOperation, OperationContext } from 'urql';
import { fromValue } from 'wonka';

import type { Props } from '..';
import * as FundQueries from '~client/gql/queries/funds';
import { mockClient } from '~client/test-utils';
import type { FundHistoryIndividualQueryVariables } from '~client/types/gql';

export const props: Props = {
  id: 123,
  item: 'My fund',
  values: [
    [
      [100, 42.3],
      [101, 41.2],
      [102, 45.9],
      [102.5, 46.9],
    ],
    [
      [104, 47.1],
      [105, 46.9],
      [106, 42.5],
    ],
  ],
  stockSplits: [{ date: new Date('2022-11-02'), ratio: 3 }],
  sold: false,
};

export function mockApiResponse(): void {
  jest.spyOn(mockClient, 'executeQuery').mockImplementation((request) => {
    if (
      request.query === FundQueries.FundHistoryIndividual &&
      (request.variables as FundHistoryIndividualQueryVariables).id === 123
    ) {
      return fromValue({
        operation: makeOperation('query', request, {} as OperationContext),
        data: {
          fundHistoryIndividual: {
            values: [
              { date: 1667239199, price: 806.22 * 3 },
              { date: 1667247661, price: 809.67 * 3 },
              { date: 1667301239, price: 765.18 * 3 },
              { date: 1667318912, price: 783.91 * 3 }, // 2022-11-01
              { date: 1667476991, price: 814.77 }, // 2022-11-03
              { date: 1667548872, price: 819.46 },
              { date: 1667615662, price: 817.42 },
              { date: 1667649184, price: 862.17 },
            ],
          },
        },
      });
    }
    return fromValue({
      operation: makeOperation('query', request, {} as OperationContext),
      data: null,
    });
  });
}
