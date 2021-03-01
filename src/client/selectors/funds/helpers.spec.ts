import getUnixTime from 'date-fns/getUnixTime';
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
              stockSplits: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('other-id'),
              item: 'bar fund',
              transactions: [],
              stockSplits: [],
              allocationTarget: 0,
            },
          ],
          __optimistic: [RequestType.delete, undefined],
        },
      }),
    ).toStrictEqual<Fund[]>([
      {
        id: numericHash('other-id'),
        item: 'bar fund',
        transactions: [],
        stockSplits: [],
        allocationTarget: 0,
      },
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
              stockSplits: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('other-id'),
              item: 'bar fund',
              transactions: [],
              stockSplits: [],
              allocationTarget: 0,
            },
          ],
          __optimistic: [undefined, undefined],
        },
      }),
    ).toStrictEqual<Fund[]>([
      {
        id: numericHash('other-id'),
        item: 'bar fund',
        transactions: [],
        stockSplits: [],
        allocationTarget: 0,
      },
      {
        id: numericHash('some-id'),
        item: 'foo fund',
        transactions: [],
        stockSplits: [],
        allocationTarget: 0,
      },
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
      17: [expect.objectContaining({ startIndex: 1, values: [989, 1054, 1185.32] })],
    });
  });

  describe('when a fund has its stock split', () => {
    const stateWithSplit: State = {
      ...state,
      [PageNonStandard.Funds]: {
        ...state[PageNonStandard.Funds],
        items: [
          {
            id: 17,
            item: 'Some fund',
            transactions: [],
            stockSplits: [
              { date: new Date('2020-04-20'), ratio: 5 },
              { date: new Date('2020-04-23'), ratio: 3 },
            ],
          },
        ],
        startTime: getUnixTime(new Date('2020-04-15')),
        cacheTimes: [
          86400 * 1.01, // 2020-04-16
          86400 * 2.03, // 2020-04-17
          86400 * 3.36, // 2020-04-18
          86400 * 4.32, // 2020-04-19
          86400 * 5.19, // 2020-04-20
          86400 * 6.34, // 2020-04-21
          86400 * 7.75, // 2020-04-22
          86400 * 8.42, // 2020-04-23
          86400 * 9.05, // 2020-04-24
          86400 * 10.38, // 2020-04-25
        ],
        prices: {
          17: [
            { startIndex: 0, values: [989, 1054] },
            { startIndex: 3, values: [1037, 259, 249, 251, 78, 82, 80] },
          ],
        },
      },
    };

    it('should add price rebase ratios to the values', () => {
      expect.assertions(1);
      const result = getFundsCache(stateWithSplit);

      expect(result.prices).toStrictEqual({
        17: [
          {
            startIndex: 0,
            values: [989, 1054],
            rebasePriceRatio: [5 * 3, 5 * 3],
          },
          {
            startIndex: 3,
            values: [1037, 259, 249, 251, 78, 82, 80],
            rebasePriceRatio: [
              5 * 3, // 2020-04-19
              3, // 2020-04-20
              3, // 2020-04-21
              3, // 2020-04-22
              1, // 2020-04-23
              1, // 2020-04-24
              1, // 2020-04-25
            ],
          },
        ],
      });
    });
  });
});
