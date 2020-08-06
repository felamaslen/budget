import numericHash from 'string-hash';
import { getFundsRows } from './helpers';

import { testState as state } from '~client/test-data';
import { Page, RequestType, Fund } from '~client/types';

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
              id: numericHash('some-id'),
              item: 'foo fund',
              transactions: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('other-id'),
              item: 'bar fund',
              transactions: [],
              allocationTarget: 0,
            },
          ],
          __optimistic: [RequestType.delete, undefined],
        },
      }),
    ).toStrictEqual<Fund[]>([
      { id: numericHash('other-id'), item: 'bar fund', transactions: [], allocationTarget: 0 },
    ]);
  });

  it('should order by item', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              id: numericHash('some-id'),
              item: 'foo fund',
              transactions: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('other-id'),
              item: 'bar fund',
              transactions: [],
              allocationTarget: 0,
            },
          ],
          __optimistic: [undefined, undefined],
        },
      }),
    ).toStrictEqual<Fund[]>([
      { id: numericHash('other-id'), item: 'bar fund', transactions: [], allocationTarget: 0 },
      { id: numericHash('some-id'), item: 'foo fund', transactions: [], allocationTarget: 0 },
    ]);
  });
});
