import { getFundsRows } from './helpers';

import { testState as state } from '~client/test-data';
import { Page, RequestType } from '~client/types';

describe('getFundsRows', () => {
  it('should exclude optimistically deleted items', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              id: 'some-id',
              item: 'foo fund',
              transactions: [],
            },
            { id: 'other-id', item: 'bar fund', transactions: [] },
          ],
          __optimistic: [RequestType.delete, undefined],
        },
      }),
    ).toStrictEqual([{ id: 'other-id', item: 'bar fund', transactions: [] }]);
  });

  it('should order by item', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            { id: 'some-id', item: 'foo fund', transactions: [] },
            { id: 'other-id', item: 'bar fund', transactions: [] },
          ],
          __optimistic: [undefined, undefined],
        },
      }),
    ).toStrictEqual([
      { id: 'other-id', item: 'bar fund', transactions: [] },
      { id: 'some-id', item: 'foo fund', transactions: [] },
    ]);
  });
});
