import addDays from 'date-fns/addDays';
import getUnixTime from 'date-fns/getUnixTime';
import numericHash from 'string-hash';

import {
  getFundsCachedValueAgeText,
  getFundsCachedValue,
  getFundsCost,
  getPortfolio,
  getCashToInvest,
  getDayGain,
  getDayGainAbs,
  getMaxAllocationTarget,
  getStockValue,
  getCashInBank,
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
          { date: new Date('2019-07-23'), units: 13, price: 0.92308, fees: 0, taxes: 0 },
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
    it('should get the amount invested between two given dates, excluding sell orders', () => {
      expect.assertions(2);

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-04-28'))(state),
      ).toBeCloseTo(450 * 100);

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-05-10'))(state),
      ).toBeCloseTo(450 * 100 + 428 * 934 + 148 + 100);
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

  describe('getCashInBank', () => {
    it('should get the easy-access cash total from the previous month net worth data', () => {
      expect.assertions(1);
      const today = new Date('2018-03-30T09:32:10+0100');
      expect(getCashInBank(today)(state)).toBe(Math.round(10324 + 37.5 * 0.035 * 100 + 1296523));
    });

    describe('when in the middle of the month', () => {
      const stateWithCostSoFar: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              id: 1000,
              item: 'fund 1',
              transactions: [
                {
                  date: new Date('2018-03-19'),
                  price: 123,
                  units: 473,
                  fees: 165,
                  taxes: 9965,
                },
                {
                  date: new Date('2018-03-21'),
                  price: 125,
                  units: 91,
                  fees: 449,
                  taxes: 6694,
                },
              ],
              stockSplits: [],
              allocationTarget: 100,
            },
          ],
          __optimistic: [undefined],
        },
        [PageListStandard.Income]: {
          ...state[PageListStandard.Income],
          items: [
            {
              id: 1,
              date: new Date('2018-03-09'),
              item: 'Income 1',
              cost: 325600,
            },
          ],
          __optimistic: [undefined],
        },
        [PageListStandard.Bills]: {
          ...state[PageListStandard.Bills],
          items: [
            {
              id: 1,
              date: new Date('2018-03-07'),
              item: 'Bill 1',
              cost: 175000,
            },
            {
              id: 2,
              date: new Date('2018-03-04'),
              item: 'Deleted bill',
              cost: 5644,
            },
          ],
          __optimistic: [undefined, RequestType.delete],
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
          ],
          __optimistic: [undefined],
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

      it.each`
        item                | dates           | delta
        ${'fund purchases'} | ${['20', '21']} | ${125 * 91 + 449 + 6694}
        ${'bills'}          | ${['06', '07']} | ${175000}
        ${'food'}           | ${['01', '02']} | ${105}
        ${'general'}        | ${['05', '06']} | ${1776}
        ${'holiday'}        | ${['12', '13']} | ${9994}
        ${'social'}         | ${['14', '15']} | ${1293}
      `('should take away the cost of $item up to the current date', ({ dates, delta }) => {
        expect.assertions(1);

        const date0 = new Date(`2018-03-${dates[0]}T09:56:10+0100`);
        const date1 = new Date(`2018-03-${dates[1]}T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0 - delta);
      });

      it('should exclude optimistically deleted items', () => {
        expect.assertions(1);

        const date0 = new Date(`2020-03-03T09:56:10+0100`);
        const date1 = new Date(`2020-03-04T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0);
      });

      it('should add the value of income up to the current date', () => {
        expect.assertions(1);

        const date0 = new Date(`2018-03-08T09:56:10+0100`);
        const date1 = new Date(`2018-03-09T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0 + 325600);
      });
    });
  });

  describe('getCashToInvest', () => {
    const today = new Date('2018-04-07T16:32:10+0100');

    it('should get the difference between net worth ISA value and start-of-month stocks value', () => {
      expect.assertions(1);
      expect(getCashToInvest(today)(state)).toMatchInlineSnapshot(`661996.8`);
    });

    describe('if the stock value has deviated in the current month', () => {
      const stateWithDeviation: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          startTime: state[PageNonStandard.Funds].startTime,
          cacheTimes: [
            ...state[PageNonStandard.Funds].cacheTimes,
            getUnixTime(new Date('2018-04-03')) - state[PageNonStandard.Funds].startTime,
          ],
          prices: {
            10: [
              {
                startIndex: state[PageNonStandard.Funds].prices[10]?.[0]?.startIndex ?? 0,
                values: [...(state[PageNonStandard.Funds].prices[10]?.[0]?.values ?? []), 400],
              },
            ],
          },
        },
      };

      it('should use the value of the fund at the start of the month, instead of the latest value', () => {
        expect.assertions(1);

        const cashToInvest = getCashToInvest(today)(stateWithDeviation);

        expect(cashToInvest).toBe(661996.8);
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
