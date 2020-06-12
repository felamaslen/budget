import { getFundsRows } from './helpers';

import { testState as state } from '~client/test-data/state';
import { RequestType } from '~client/types/crud';

describe('getFundsRows', () => {
  it('should exclude optimistically deleted items', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        funds: {
          ...state.funds,
          items: [
            {
              id: 'some-id',
              item: 'foo fund',
              transactions: [],
              __optimistic: RequestType.delete,
            },
            { id: 'other-id', item: 'bar fund', transactions: [] },
          ],
        },
      }),
    ).toStrictEqual([{ id: 'other-id', item: 'bar fund', transactions: [] }]);
  });

  it('should order by item', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        funds: {
          ...state.funds,
          items: [
            { id: 'some-id', item: 'foo fund', transactions: [] },
            { id: 'other-id', item: 'bar fund', transactions: [] },
          ],
        },
      }),
    ).toStrictEqual([
      { id: 'other-id', item: 'bar fund', transactions: [] },
      { id: 'some-id', item: 'foo fund', transactions: [] },
    ]);
  });
});
