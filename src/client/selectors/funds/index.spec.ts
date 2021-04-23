import addDays from 'date-fns/addDays';
import getUnixTime from 'date-fns/getUnixTime';
import numericHash from 'string-hash';

import {
  getCashBreakdown,
  getFundsCachedValueAgeText,
  getFundsCachedValue,
  getFundsCost,
  getPortfolio,
  getDayGain,
  getDayGainAbs,
  getMaxAllocationTarget,
  getStockValue,
  getInvestmentsBetweenDates,
} from '.';

import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';
import type { CachedValue, FundNative, Portfolio } from '~client/types';
import { PageListStandard, PageNonStandard, RequestType } from '~client/types/enum';

describe('Funds selectors', () => {
  const testNow = new Date('2018-03-23T11:45:20Z');

  const testToday = new Date('2020-04-20');

  const stateWithOnlyFutureTransaction: State = {
    ...state,
    [PageNonStandard.Funds]: {
      ...state[PageNonStandard.Funds],
      items: [
        {
          ...state[PageNonStandard.Funds].items[0],
          id: 10,
          transactions: [
            {
              ...state[PageNonStandard.Funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ],
        },
        {
          ...state[PageNonStandard.Funds].items[1],
          id: 3,
        },
      ],
    },
  };

  const stateWithFutureTransaction: State = {
    ...state,
    [PageNonStandard.Funds]: {
      ...state[PageNonStandard.Funds],
      items: [
        {
          ...state[PageNonStandard.Funds].items[0],
          id: 10,
          transactions: [
            ...state[PageNonStandard.Funds].items[0].transactions,
            {
              ...state[PageNonStandard.Funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ],
        },
        ...state[PageNonStandard.Funds].items.slice(1),
      ],
    },
  };

  describe('getFundsCachedValueAgeText', () => {
    it('should return the expected string', () => {
      expect.assertions(1);
      const now = new Date('2018-06-03');

      expect(getFundsCachedValueAgeText(getUnixTime(now) - 4000, [0, 100, 400], now)).toBe(
        '1 hour ago',
      );
    });

    it('getFundsCachedValueAgeText uses only one unit', () => {
      expect.assertions(1);
      const now = new Date('2018-06-03');

      expect(
        getFundsCachedValueAgeText(getUnixTime(now) - 86400 - 3600 * 5.4, [0, 100, 400], now),
      ).toBe('1 day ago');
    });
  });

  describe('getFundsCachedValue', () => {
    it.each`
      prop            | expectedValue
      ${'value'}      | ${399098.2}
      ${'ageText'}    | ${'7 months ago'}
      ${'gain'}       | ${0.0827}
      ${'gainAbs'}    | ${60780.2}
      ${'dayGain'}    | ${getDayGain(state)}
      ${'dayGainAbs'} | ${getDayGainAbs(state)}
    `('should get $prop', ({ prop, expectedValue }) => {
      expect.assertions(1);
      const result = getFundsCachedValue.now(testNow)(state);

      if (typeof expectedValue === 'number') {
        expect(result[prop as keyof CachedValue]).toBeCloseTo(expectedValue, 1);
      } else {
        expect(result).toHaveProperty(prop, expectedValue);
      }
    });

    const itemsWithoutPriceData: FundNative[] = [
      ...state[PageNonStandard.Funds].items,
      {
        id: numericHash('some-id'),
        item: 'new fund',
        transactions: [
          {
            date: new Date('2019-07-23'),
            units: 13,
            price: 0.92308,
            fees: 0,
            taxes: 0,
            drip: false,
          },
        ],
        stockSplits: [],
      },
    ];

    const itemsWithFutureTransaction: FundNative[] = [
      {
        ...state[PageNonStandard.Funds].items[0],
        transactions: [
          ...state[PageNonStandard.Funds].items[0].transactions,
          {
            date: addDays(testNow, 1),
            units: 1000,
            price: 0.1,
            fees: 0,
            taxes: 0,
            drip: false,
          },
        ],
        stockSplits: [],
      },
      ...state[PageNonStandard.Funds].items.slice(1),
    ];

    it.each`
      condition                       | items
      ${'funds without price data'}   | ${itemsWithoutPriceData}
      ${'transactions in the future'} | ${itemsWithFutureTransaction}
    `('should skip $condition', ({ items }) => {
      expect.assertions(1);
      const stateNoPrice: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items,
        },
      };

      expect(getFundsCachedValue.now(testNow)(stateNoPrice)).toStrictEqual({
        gain: expect.any(Number),
        gainAbs: expect.any(Number),
        dayGain: getDayGain(stateNoPrice),
        dayGainAbs: getDayGainAbs(stateNoPrice),
        value: 399098.2,
        ageText: '7 months ago',
      });
    });
  });

  describe('getFundsCost', () => {
    it('should get the all-time total fund cost', () => {
      expect.assertions(1);
      expect(getFundsCost(testToday)(state)).toBeCloseTo(
        400000 + 45000 - 50300 + 90000 - 80760 + 200000 - 265622,
        1,
      );
    });

    it('should ignore future transactions', () => {
      expect.assertions(1);
      expect(getFundsCost(testToday)(stateWithFutureTransaction)).toBe(
        getFundsCost(testToday)(state),
      );
    });
  });

  describe('getInvestmentsBetweenDates', () => {
    it('should get the amount invested between two given dates, including sell orders', () => {
      expect.assertions(2);

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-04-28'))(state),
      ).toBeCloseTo(
        450 * 100 - 450 * 112 + (20 + 80) - 1117.87 * 72.24453648 - 1499.7 * 177.1167567,
      );

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-05-10'))(state),
      ).toBeCloseTo(
        450 * 100 +
          428 * 934 +
          148 +
          100 -
          450 * 112 +
          (20 + 80) -
          1117.87 * 72.24453648 -
          1499.7 * 177.1167567,
      );
    });
  });

  describe('getPortfolio', () => {
    it('should get the latest value for every fund, where available', () => {
      expect.assertions(1);

      const result = getPortfolio(new Date('2020-04-20'))(state);

      expect(result).toStrictEqual<Portfolio>([
        {
          id: 10,
          item: 'some fund 1',
          value: 399098.2,
          allocationTarget: 0,
        },
        {
          id: 3,
          item: 'some fund 2',
          value: 0,
          allocationTarget: 0,
        },
        {
          id: 1,
          item: 'some fund 3',
          value: 0,
          allocationTarget: 0,
        },
        {
          id: 5,
          item: 'test fund 4',
          value: 0,
          allocationTarget: 0,
        },
      ]);
    });

    it('should not include fund transactions from the future', () => {
      expect.assertions(1);

      const result = getPortfolio(testToday)(stateWithOnlyFutureTransaction);

      expect(result.find(({ id }) => id === 10)).toBeUndefined();
    });
  });

  describe('getStockValue', () => {
    it('should get the current paper value of stocks', () => {
      expect.assertions(1);
      expect(getStockValue(testToday)(state)).toMatchInlineSnapshot(`399098.2`);
    });
  });

  describe('getCashBreakdown', () => {
    const today = new Date('2018-03-30T09:32:10+0100');

    const stateWithCashTotal: State = {
      ...state,
      netWorth: {
        ...state.netWorth,
        cashTotal: {
          cashInBank: 1886691,
          cashToInvest: 2996287,
          stockValue: 7765614,
          date: new Date('2018-02-27'),
        },
      },
    };

    it('should return the cashInBank value from the state', () => {
      expect.assertions(1);
      expect(getCashBreakdown(today)(stateWithCashTotal).cashInBank).toBe(1886691);
    });

    it('should return the cashToInvest value from the state', () => {
      expect.assertions(1);
      expect(getCashBreakdown(today)(stateWithCashTotal).cashToInvest).toBe(2996287);
    });

    describe('when there has been income since the last net worth date', () => {
      const stateWithIncome: State = {
        ...stateWithCashTotal,
        [PageListStandard.Income]: {
          ...state[PageListStandard.Income],
          items: [
            {
              id: 1,
              date: new Date('2018-03-09'),
              item: 'Income 1',
              category: 'Salary',
              cost: 325600,
              shop: 'Company 1',
            },
            {
              id: 2,
              date: new Date('2018-02-27'),
              item: 'Old income',
              category: 'Salary',
              cost: 198823,
              shop: 'Company 2',
            },
          ],
          __optimistic: [undefined, undefined],
        },
      };

      it('should add the income value to the bank cash', () => {
        expect.assertions(1);
        expect(getCashBreakdown(today)(stateWithIncome).cashInBank).toBe(1886691 + 325600);
      });
    });

    describe('when there are purchase transactions since the last net worth date', () => {
      const stateWithPurchases: State = {
        ...stateWithCashTotal,
        [PageListStandard.Bills]: {
          ...state[PageListStandard.Bills],
          items: [
            {
              id: 1,
              // this is the previous month, but after the net worth date so should be included
              date: new Date('2018-02-28'),
              item: 'Bill 1',
              category: 'Energy',
              cost: 175000,
              shop: 'My energy supplier',
            },
            {
              id: 2,
              date: new Date('2018-03-04'),
              item: 'Deleted bill',
              category: 'Energy',
              cost: 5644,
              shop: 'My energy supplier',
            },
            {
              id: 3,
              date: new Date('2018-02-26'),
              item: 'Old bill',
              category: 'Internet',
              cost: 81022,
              shop: 'My ISP',
            },
          ],
          __optimistic: [undefined, RequestType.delete, undefined],
        },
        [PageListStandard.Food]: {
          ...state[PageListStandard.Food],
          items: [
            {
              id: 1,
              date: new Date('2018-03-02'),
              item: 'Food 1',
              category: 'Food category 1',
              cost: 105,
              shop: 'Shop 1',
            },
            {
              id: 2,
              date: new Date('2018-02-23'),
              item: 'Old food',
              category: 'Food category 2',
              cost: 558,
              shop: 'Shop 1',
            },
          ],
          __optimistic: [undefined, undefined],
        },
        [PageListStandard.General]: {
          ...state[PageListStandard.General],
          items: [
            {
              id: 1,
              date: new Date('2018-03-06'),
              item: 'General 1',
              category: 'General category 1',
              cost: 1776,
              shop: 'Shop 1',
            },
          ],
          __optimistic: [undefined],
        },
        [PageListStandard.Holiday]: {
          ...state[PageListStandard.Holiday],
          items: [
            {
              id: 1,
              date: new Date('2018-03-13'),
              item: 'Some holiday item 1',
              category: 'Holiday 1',
              cost: 9994,
              shop: 'Shop 2',
            },
          ],
          __optimistic: [undefined],
        },
        [PageListStandard.Social]: {
          ...state[PageListStandard.Social],
          items: [
            {
              id: 1,
              date: new Date('2018-03-15'),
              item: 'Some social item 1',
              category: 'Social 1',
              cost: 1293,
              shop: 'Shop 3',
            },
          ],
          __optimistic: [undefined],
        },
      };

      it('should remove the purchase costs from the bank cash', () => {
        expect.assertions(1);
        expect(getCashBreakdown(today)(stateWithPurchases).cashInBank).toBe(
          1886691 - (175000 + 105 + 1776 + 9994 + 1293),
        );
      });
    });

    describe('when there are fund transactions since the last net worth date', () => {
      const stateWithTransactions: State = {
        ...stateWithCashTotal,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              id: 1000,
              item: 'fund 1',
              transactions: [
                {
                  date: new Date('2018-02-27'), // not counted as on same date as net worth value
                  price: 127.2,
                  units: 1887,
                  fees: 652,
                  taxes: 4763,
                  drip: false,
                },
                {
                  date: new Date('2018-02-28'),
                  price: 123,
                  units: 473,
                  fees: 165,
                  taxes: 9965,
                  drip: false,
                },
                {
                  date: new Date('2018-03-21'),
                  price: 125,
                  units: 91,
                  fees: 449,
                  taxes: 6694,
                  drip: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 100,
            },
          ],
          __optimistic: [undefined],
        },
      };

      it('should remove the cost of the transactions from the cash to invest', () => {
        expect.assertions(2);
        const result = getCashBreakdown(today)(stateWithTransactions);

        expect(result.cashToInvest).toBe(
          2996287 - (123 * 473 + 165 + 9965 + 125 * 91 + 449 + 6694),
        );
        expect(result.cashInBank).toBe(1886691);
      });

      describe('when the investable cash is smaller than the transaction cost', () => {
        const stateWithSmallInvestableCash: State = {
          ...stateWithTransactions,
          netWorth: {
            ...stateWithTransactions.netWorth,
            cashTotal: {
              ...stateWithTransactions.netWorth.cashTotal,
              cashInBank: 100667,
              cashToInvest: 123 * 473 + 165 + 9965 + 125 * 91 + 449 + 6694 - 8455,
            },
          },
        };

        it('should take from the bank cash value', () => {
          expect.assertions(2);
          const result = getCashBreakdown(today)(stateWithSmallInvestableCash);

          expect(result.cashToInvest).toBe(0);
          expect(result.cashInBank).toBe(100667 - 8455);
        });
      });
    });
  });

  describe('getMaxAllocationTarget', () => {
    it('should return the remainder of the allocation after accounting for the given fund', () => {
      expect.assertions(2);

      const stateWithAllocation: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund-1'),
              item: 'Fund 1',
              transactions: [],
              stockSplits: [],
              allocationTarget: 30,
            },
            {
              id: numericHash('fund-2'),
              item: 'Fund 2',
              transactions: [],
              stockSplits: [],
              allocationTarget: 45,
            },
          ],
        },
      };

      expect(getMaxAllocationTarget(numericHash('fund-1'))(stateWithAllocation)).toBe(100 - 45);

      expect(getMaxAllocationTarget(numericHash('fund-2'))(stateWithAllocation)).toBe(100 - 30);
    });
  });
});
