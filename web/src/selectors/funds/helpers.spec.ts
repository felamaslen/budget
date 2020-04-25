import { getFundsRows } from './helpers';

import state from '~client/test-data/state';
import { DELETE } from '~client/constants/data';

describe('getFundsRows', () => {
  it('should exclude optimistically deleted items', () => {
    expect(
      getFundsRows({
        funds: {
          ...state.funds,
          items: [
            { id: 'some-id', item: 'foo fund', transactions: null, __optimistic: DELETE },
            { id: 'other-id', item: 'bar fund', transactions: null },
          ],
        },
      }),
    ).toEqual([{ id: 'other-id', item: 'bar fund', transactions: null }]);
  });

  it('should order by item', () => {
    expect(
      getFundsRows({
        funds: {
          ...state.funds,
          items: [
            { id: 'some-id', item: 'foo fund', transactions: null },
            { id: 'other-id', item: 'bar fund', transactions: null },
          ],
        },
      }),
    ).toEqual([
      { id: 'other-id', item: 'bar fund', transactions: null },
      { id: 'some-id', item: 'foo fund', transactions: null },
    ]);
  });
});
