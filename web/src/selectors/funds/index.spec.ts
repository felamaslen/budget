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
} from '.';
import { Period } from '~client/constants';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { Cache } from '~client/reducers/funds';
import { testState as state } from '~client/test-data/state';
import { Page, Portfolio, CachedValue, RequestType } from '~client/types';

describe('Funds selectors', () => {
  const testNow = new Date('2018-03-23T11:45:20Z');

  const testToday = new Date('2020-04-20');

  const stateWithOnlyFutureTransaction: State = {
    ...state,
    [Page.funds]: {
      ...state[Page.funds],
      items: [
        {
          ...state[Page.funds].items[0],
          id: 10,
          transactions: getTransactionsList([
            {
              ...state[Page.funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ]),
        },
        {
          ...state[Page.funds].items[1],
          id: 3,
        },
      ],
    },
  };

  const stateWithFutureTransaction: State = {
    ...state,
    [Page.funds]: {
      ...state[Page.funds],
      items: [
        {
          ...state[Page.funds].items[0],
          id: 10,
          transactions: getTransactionsList([
            ...state[Page.funds].items[0].transactions,
            {
              ...state[Page.funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ]),
        },
        ...state[Page.funds].items.slice(1),
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
      const result = getFundsCachedValue(testNow)(state);

      if (typeof expectedValue === 'number') {
        expect(result[prop as keyof CachedValue]).toBeCloseTo(expectedValue, 1);
      } else {
        expect(result).toHaveProperty(prop, expectedValue);
      }
    });

    it('should return a default value if there are no data', () => {
      expect.assertions(1);
      const stateNoCache: State = {
        ...state,
        funds: {
          ...state.funds,
          cache: {},
        },
      };

      expect(getFundsCachedValue(testNow)(stateNoCache)).toStrictEqual({
        gain: 0,
        gainAbs: 0,
        dayGain: getDayGain(stateNoCache),
        dayGainAbs: getDayGainAbs(stateNoCache),
        value: 0,
        ageText: '',
      });
    });

    const itemsWithoutPriceData = [
      ...state[Page.funds].items,
      {
        id: 'some-id',
        item: 'new fund',
        transactions: getTransactionsList([
          { date: '2019-07-23', units: 13, price: 0.92308, fees: 0, taxes: 0 },
        ]),
      },
    ];

    const itemsWithFutureTransaction = [
      {
        ...state[Page.funds].items[0],
        transactions: getTransactionsList([
          ...state[Page.funds].items[0].transactions,
          {
            date: addDays(testNow, 1),
            units: 1000,
            price: 0.1,
            fees: 0,
            taxes: 0,
          },
        ]),
      },
      ...state[Page.funds].items.slice(1),
    ];

    it.each`
      condition                       | items
      ${'funds without price data'}   | ${itemsWithoutPriceData}
      ${'transactions in the future'} | ${itemsWithFutureTransaction}
    `('should skip $condition', ({ items }) => {
      expect.assertions(1);
      const stateNoPrice = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items,
        },
      };

      expect(getFundsCachedValue(testNow)(stateNoPrice)).toStrictEqual({
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
    it('should get the easy-access cash total from the net worth data', () => {
      expect.assertions(1);
      const today = new Date('2017-09-30T09:32:10+0100');
      expect(getCashInBank(today)(state)).toMatchInlineSnapshot(`1061095`);
    });

    describe('when in the middle of the month', () => {
      const stateWithCostSoFar: State = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              id: 1000,
              item: 'fund 1',
              transactions: getTransactionsList([
                {
                  date: '2020-05-19',
                  price: 123,
                  units: 473,
                  fees: 165,
                  taxes: 9965,
                },
                {
                  date: '2020-05-21',
                  price: 125,
                  units: 91,
                  fees: 449,
                  taxes: 6694,
                },
              ]),
              allocationTarget: 1,
            },
          ],
          __optimistic: [undefined],
        },
        [Page.income]: {
          ...state[Page.income],
          items: [
            {
              id: 1,
              date: new Date('2020-05-09'),
              item: 'Income 1',
              cost: 325600,
            },
          ],
          __optimistic: [undefined],
        },
        [Page.bills]: {
          ...state[Page.bills],
          items: [
            {
              id: 1,
              date: new Date('2020-05-07'),
              item: 'Bill 1',
              cost: 175000,
            },
            {
              id: 2,
              date: new Date('2020-05-04'),
              item: 'Deleted bill',
              cost: 5644,
            },
          ],
          __optimistic: [undefined, RequestType.delete],
        },
        [Page.food]: {
          ...state[Page.food],
          items: [
            {
              id: 1,
              date: new Date('2020-05-02'),
              item: 'Food 1',
              category: 'Food category 1',
              cost: 105,
              shop: 'Shop 1',
            },
          ],
          __optimistic: [undefined],
        },
        [Page.general]: {
          ...state[Page.general],
          items: [
            {
              id: 1,
              date: new Date('2020-05-06'),
              item: 'General 1',
              category: 'General category 1',
              cost: 1776,
              shop: 'Shop 1',
            },
          ],
          __optimistic: [undefined],
        },
        [Page.holiday]: {
          ...state[Page.holiday],
          items: [
            {
              id: 1,
              date: new Date('2020-05-13'),
              item: 'Some holiday item 1',
              holiday: 'Holiday 1',
              cost: 9994,
              shop: 'Shop 2',
            },
          ],
          __optimistic: [undefined],
        },
        [Page.social]: {
          ...state[Page.social],
          items: [
            {
              id: 1,
              date: new Date('2020-05-15'),
              item: 'Some social item 1',
              society: 'Social 1',
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

        const date0 = new Date(`2020-05-${dates[0]}T09:56:10+0100`);
        const date1 = new Date(`2020-05-${dates[1]}T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0 - delta);
      });

      it('should exclude optimistically deleted items', () => {
        expect.assertions(1);

        const date0 = new Date(`2020-05-03T09:56:10+0100`);
        const date1 = new Date(`2020-05-04T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0);
      });

      it('should add the value of income up to the current date', () => {
        expect.assertions(1);

        const date0 = new Date(`2020-05-08T09:56:10+0100`);
        const date1 = new Date(`2020-05-09T09:56:10+0100`);

        const cashOnDate0 = getCashInBank(date0)(stateWithCostSoFar);
        const cashOnDate1 = getCashInBank(date1)(stateWithCostSoFar);

        expect(cashOnDate1).toBe(cashOnDate0 + 325600);
      });
    });
  });

  describe('getCashToInvest', () => {
    const today = new Date('2017-09-07T16:32:10+0100');

    it('should get the difference between net worth ISA value and start-of-month stocks value', () => {
      expect.assertions(1);
      expect(getCashToInvest(today)(state)).toMatchInlineSnapshot(`664985.6`);
    });

    describe('if the stock value has deviated in the current month', () => {
      const stateWithDeviation: State = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          cache: {
            [Period.year1]: {
              ...state[Page.funds].cache[Period.year1],
              cacheTimes: [
                ...(state[Page.funds].cache[Period.year1]?.cacheTimes ?? []),
                28623600 + 86400 * 3,
              ],
              prices: {
                ...state[Page.funds].cache[Period.year1]?.prices,
                10: {
                  ...state[Page.funds].cache[Period.year1]?.prices[10],
                  values: [
                    ...(state[Page.funds].cache[Period.year1]?.prices[10]?.values ?? []),
                    400,
                  ],
                },
              },
            } as Cache,
          },
        },
      };

      it('should use the value of the fund at the start of the month, instead of the latest value', () => {
        expect.assertions(1);

        const cashToInvest = getCashToInvest(today)(stateWithDeviation);

        expect(cashToInvest).toBe(664985.6);
      });
    });
  });

  describe('getMaxAllocationTarget', () => {
    it('should return the remainder of the allocation after accounting for the given fund', () => {
      expect.assertions(2);

      const stateWithAllocation: State = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              id: numericHash('fund-1'),
              item: 'Fund 1',
              transactions: [],
              allocationTarget: 0.3,
            },
            {
              id: numericHash('fund-2'),
              item: 'Fund 2',
              transactions: [],
              allocationTarget: 0.45,
            },
          ],
        },
      };

      expect(getMaxAllocationTarget(numericHash('fund-1'))(stateWithAllocation)).toBe(1 - 0.45);

      expect(getMaxAllocationTarget(numericHash('fund-2'))(stateWithAllocation)).toBe(1 - 0.3);
    });
  });
});
