import { getUnixTime } from 'date-fns';
import numericHash from 'string-hash';

import { getFundsCache, getFundsRows } from './helpers';
import { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data';
import { Fund, FundQuotes, PageNonStandard, RequestType } from '~client/types';

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
    },
  };

  it('should combine the scraped cache with the latest values', () => {
    expect.assertions(3);
    const now = new Date('2020-04-20');
    const result = getFundsCache.now(now)(stateWithQuotes);

    expect(result.startTime).toBe(123);
    expect(result.cacheTimes).toStrictEqual([456, 789, getUnixTime(now) - 123]);
    expect(result.prices).toStrictEqual({
      17: [{ startIndex: 1, values: [989, 1054, 1185.32] }],
    });
  });
});
