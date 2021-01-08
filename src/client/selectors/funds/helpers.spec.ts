import numericHash from 'string-hash';

import { getFundsCache, getFundsRows } from './helpers';
import type { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data';
import type { FundQuotes } from '~client/types';
import { PageNonStandard, RequestType } from '~client/types/enum';
import type { Fund } from '~client/types/gql';

describe('getFundsRows', () => {
  it('should exclude optimistically deleted items', () => {
    expect.assertions(1);
    expect(
      getFundsRows({
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
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
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
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

describe('getFundsCache', () => {
  const quotes: FundQuotes = {
    17: 1185.32,
  };
  const stateWithQuotes: State = {
    ...state,
    [PageNonStandard.Funds]: {
      ...state[PageNonStandard.Funds],
      startTime: 123,
      cacheTimes: [456, 789],
      prices: {
        17: [{ startIndex: 1, values: [989, 1054] }],
      },
      todayPrices: quotes,
      todayPriceFetchTime: 8876,
    },
  };

  it('should combine the scraped cache with the latest values', () => {
    expect.assertions(3);
    const result = getFundsCache(stateWithQuotes);

    expect(result.startTime).toBe(123);
    expect(result.cacheTimes).toStrictEqual([456, 789, 8876 - 123]);
    expect(result.prices).toStrictEqual({
      17: [{ startIndex: 1, values: [989, 1054, 1185.32] }],
    });
  });
});
