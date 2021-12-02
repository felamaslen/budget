import { addDays, endOfDay } from 'date-fns';
import numericHash from 'string-hash';

import {
  getCashBreakdown,
  getFundsCachedValue,
  getFundsCost,
  getPortfolio,
  getMaxAllocationTarget,
  getStockValue,
  getInvestmentsBetweenDates,
  getFundsValueTodayWithoutPension,
} from '.';

import type { State } from '~client/reducers';
import { testState } from '~client/test-data/state';
import type { FundsCachedValue, FundNative, Portfolio } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

describe('funds selectors', () => {
  const testNow = new Date('2020-04-20T19:45:20Z');
  const testToday = endOfDay(testNow);

  const stateWithFutureTransaction: State = {
    ...testState,
    [PageNonStandard.Funds]: {
      ...testState[PageNonStandard.Funds],
      items: [
        {
          ...testState[PageNonStandard.Funds].items[0],
          id: 10,
          transactions: [
            ...testState[PageNonStandard.Funds].items[0].transactions,
            {
              ...testState[PageNonStandard.Funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ],
        },
        ...testState[PageNonStandard.Funds].items.slice(1),
      ],
    },
  };

  describe('getFundsCachedValue', () => {
    const expectedTotalValue = 475 * 934;

    const expectedGainAbs =
      (475 - 428) * 934 -
      (148 + 100) +
      (112 - 100) * 450 -
      (20 + 80) +
      (72.24453648 - 80.510256) * 1117.87 +
      (177.1167567 - 133.36) * 1499.7;

    const expectedDayGainAbs = (475 - 476.3) * 934;

    const expectedCost =
      428 * 934 + 148 + 100 + 450 * 100 + 20 + 80 + 1117.87 * 80.510256 + 1499.7 * 133.36;

    const expectedGain = expectedGainAbs / expectedCost;
    const expectedDayGain = expectedDayGainAbs / expectedCost;

    it.each`
      prop            | expectedValue
      ${'value'}      | ${expectedTotalValue}
      ${'gain'}       | ${expectedGain}
      ${'gainAbs'}    | ${expectedGainAbs}
      ${'dayGain'}    | ${expectedDayGain}
      ${'dayGainAbs'} | ${expectedDayGainAbs}
    `('should get numeric prop "$prop"', ({ prop, expectedValue }) => {
      expect.assertions(1);
      const result = getFundsCachedValue.now(testNow)(testState);

      expect(result[prop as keyof FundsCachedValue]).toBeCloseTo(expectedValue);
    });

    it('should get expected numerical values', () => {
      expect.assertions(1);
      expect(getFundsCachedValue.now(testNow)(testState)).toMatchInlineSnapshot(`
        Object {
          "dayGain": -0.0027293722443838177,
          "dayGainAbs": -1214.2000000000116,
          "gain": 0.14330885613714536,
          "gainAbs": 105332.0081000001,
          "value": 443650,
        }
      `);
    });

    const itemsWithoutPriceData: FundNative[] = [
      ...testState[PageNonStandard.Funds].items,
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
            pension: false,
          },
        ],
        stockSplits: [],
      },
    ];

    const itemsWithFutureTransaction: FundNative[] = [
      {
        ...testState[PageNonStandard.Funds].items[0],
        transactions: [
          ...testState[PageNonStandard.Funds].items[0].transactions,
          {
            date: addDays(testNow, 1),
            units: 1000,
            price: 0.1,
            fees: 0,
            taxes: 0,
            drip: false,
            pension: false,
          },
        ],
        stockSplits: [],
      },
      ...testState[PageNonStandard.Funds].items.slice(1),
    ];

    it.each`
      condition                       | items
      ${'funds without price data'}   | ${itemsWithoutPriceData}
      ${'transactions in the future'} | ${itemsWithFutureTransaction}
    `('should skip $condition when calculating the value', ({ items }) => {
      expect.assertions(1);
      const stateWithExtraItem: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items,
        },
      };

      const resultWithExtraItem = getFundsCachedValue.now(testNow)(stateWithExtraItem);
      const resultWithoutExtraItem = getFundsCachedValue.now(testNow)(testState);

      expect(resultWithExtraItem.value).toBe(resultWithoutExtraItem.value);
    });
  });

  describe('getFundsValueTodayWithoutPension', () => {
    const stateWithPension: State = {
      ...testState,
      [PageNonStandard.Funds]: {
        ...testState[PageNonStandard.Funds],
        items: [
          {
            ...testState[PageNonStandard.Funds].items[0],
            transactions: [
              ...testState[PageNonStandard.Funds].items[0].transactions,
              {
                ...testState[PageNonStandard.Funds].items[0].transactions[0],
                pension: true,
              },
            ],
            stockSplits: [],
          },
          ...testState[PageNonStandard.Funds].items.slice(1),
        ],
      },
    };

    it('should get the total fund value, skipping pension transactions', () => {
      expect.assertions(2);
      const resultWithPension = getFundsValueTodayWithoutPension(testNow)(stateWithPension);
      const resultWithoutPension = getFundsValueTodayWithoutPension(testNow)(testState);

      expect(resultWithPension).toStrictEqual(resultWithoutPension);
      expect(resultWithoutPension).toBeCloseTo(934 * 475);
    });
  });

  describe('getFundsCost', () => {
    it('should get the all-time total fund cost', () => {
      expect.assertions(1);
      expect(getFundsCost(testToday)(testState)).toBeCloseTo(
        428 * 934 +
          (148 + 100) +
          450 * (100 - 112) +
          (20 + 80) +
          1117.87 * (80.510256 - 72.24453648) +
          1499.7 * (133.36 - 177.1167567),
        1,
      );
    });

    it('should ignore future transactions', () => {
      expect.assertions(1);
      expect(getFundsCost(testToday)(stateWithFutureTransaction)).toBe(
        getFundsCost(testToday)(testState),
      );
    });
  });

  describe('getInvestmentsBetweenDates', () => {
    it('should get the amount invested between two given dates, including sell orders', () => {
      expect.assertions(2);

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-04-28'))(testState),
      ).toBeCloseTo(
        450 * 100 - 450 * 112 + (20 + 80) - 1117.87 * 72.24453648 - 1499.7 * 177.1167567,
      );

      expect(
        getInvestmentsBetweenDates(new Date('2017-03-02'), new Date('2017-05-10'))(testState),
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

      const result = getPortfolio(testToday)(testState);

      expect(result).toStrictEqual<Portfolio>([
        {
          id: numericHash('some-fund-1'),
          item: 'some fund 1',
          value: 475 * 934,
          allocationTarget: 0,
          metadata: expect.objectContaining({}),
        },
        {
          id: numericHash('some-fund-2'),
          item: 'some fund 2',
          value: 0,
          allocationTarget: 0,
          metadata: expect.objectContaining({}),
        },
        {
          id: numericHash('some-fund-3'),
          item: 'some fund 3',
          value: 0,
          allocationTarget: 0,
          metadata: expect.objectContaining({}),
        },
        {
          id: numericHash('some-fund-4'),
          item: 'test fund 4',
          value: 0,
          allocationTarget: 0,
          metadata: expect.objectContaining({}),
        },
      ]);
    });

    it('should calculate metadata for each fund in the portfolio', () => {
      expect.assertions(4);
      const result = getPortfolio(testToday)(testState);

      expect(result[0].metadata).toMatchInlineSnapshot(`
        Object {
          "buyPriceSplitAdj": 428,
          "currentPrice": 475,
          "feesPaid": 148,
          "pnl": 43650,
          "reinvestmentPriceSplitAdj": 0,
          "sellPriceSplitAdj": 0,
          "taxesPaid": 100,
          "totalCostOfHolding": 400000,
          "unitsBought": 934,
          "unitsReinvested": 0,
          "unitsSold": -0,
        }
      `);
      expect(result[1].metadata).toMatchInlineSnapshot(`
        Object {
          "buyPriceSplitAdj": 100,
          "currentPrice": 99.29,
          "feesPaid": 20,
          "pnl": 5300,
          "reinvestmentPriceSplitAdj": 0,
          "sellPriceSplitAdj": 112,
          "taxesPaid": 80,
          "totalCostOfHolding": 45000,
          "unitsBought": 450,
          "unitsReinvested": 0,
          "unitsSold": 450,
        }
      `);
      expect(result[2].metadata).toMatchInlineSnapshot(`
        Object {
          "buyPriceSplitAdj": 80.510256,
          "currentPrice": 8114.39,
          "feesPaid": 0,
          "pnl": -9239.999899999995,
          "reinvestmentPriceSplitAdj": 0,
          "sellPriceSplitAdj": 72.24453648,
          "taxesPaid": 0,
          "totalCostOfHolding": 89999.9999,
          "unitsBought": 1117.87,
          "unitsReinvested": 0,
          "unitsSold": 1117.87,
        }
      `);
      expect(result[3].metadata).toMatchInlineSnapshot(`
        Object {
          "buyPriceSplitAdj": 133.36,
          "currentPrice": 247.5,
          "feesPaid": 0,
          "pnl": 65622.008,
          "reinvestmentPriceSplitAdj": 0,
          "sellPriceSplitAdj": 177.1167567,
          "taxesPaid": 0,
          "totalCostOfHolding": 199999.992,
          "unitsBought": 1499.7,
          "unitsReinvested": 0,
          "unitsSold": 1499.7,
        }
      `);
    });

    it('should not include fund transactions from the future', () => {
      expect.assertions(1);

      const stateWithOnlyFutureTransaction: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              ...testState[PageNonStandard.Funds].items[0],
              id: numericHash('some-fund-1'),
              transactions: [
                {
                  ...testState[PageNonStandard.Funds].items[0].transactions[0],
                  date: addDays(testToday, 1),
                },
              ],
            },
            {
              ...testState[PageNonStandard.Funds].items[1],
              id: 3,
            },
          ],
        },
      };

      const result = getPortfolio(testToday)(stateWithOnlyFutureTransaction);

      expect(result.find(({ id }) => id === numericHash('some-fund-1'))).toBeUndefined();
    });
  });

  describe('getStockValue', () => {
    it('should get the current paper value of stocks', () => {
      expect.assertions(2);
      const result = getStockValue(testToday)(testState);
      expect(result).toBeCloseTo(475 * 934);
      expect(result).toMatchInlineSnapshot(`443650`);
    });
  });

  describe('getCashBreakdown', () => {
    const today = new Date('2018-03-30T09:32:10+0100');

    const stateWithCashTotal: State = {
      ...testState,
      netWorth: {
        ...testState.netWorth,
        cashTotal: {
          cashInBank: 1886691,
          nonPensionStockValue: 7765614,
          pensionStockValue: 0,
          stocksIncludingCash: 7765614 + 2996287,
          date: new Date('2018-02-27'),
          incomeSince: 165583,
          spendingSince: 195621,
        },
      },
    };

    it('should return the cashInBank value, including income and spending since, from the state', () => {
      expect.assertions(1);
      expect(getCashBreakdown(today)(stateWithCashTotal).cashInBank).toBe(
        1886691 + 165583 - 195621,
      );
    });

    it('should not return a negative value for cashInBank', () => {
      expect.assertions(1);
      const stateWithNegativeCash: State = {
        ...stateWithCashTotal,
        netWorth: {
          ...stateWithCashTotal.netWorth,
          cashTotal: {
            ...stateWithCashTotal.netWorth.cashTotal,
            spendingSince: 11000000,
          },
        },
      };

      expect(getCashBreakdown(today)(stateWithNegativeCash).cashInBank).toBe(0);
    });

    it('should return the cashToInvest value from the state', () => {
      expect.assertions(1);
      expect(getCashBreakdown(today)(stateWithCashTotal).cashToInvest).toBe(2996287);
    });

    describe('when there are fund transactions since the last net worth date', () => {
      const stateWithTransactions: State = {
        ...stateWithCashTotal,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
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
                  pension: false,
                },
                {
                  date: new Date('2018-02-28'),
                  price: 123,
                  units: 473,
                  fees: 165,
                  taxes: 9965,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2018-03-21'),
                  price: 125,
                  units: 91,
                  fees: 449,
                  taxes: 6694,
                  drip: false,
                  pension: false,
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
        expect(result.cashInBank).toBe(1886691 + 165583 - 195621);
      });

      describe('when the investable cash is smaller than the transaction cost', () => {
        const stateWithSmallInvestableCash: State = {
          ...stateWithTransactions,
          netWorth: {
            ...stateWithTransactions.netWorth,
            cashTotal: {
              ...stateWithTransactions.netWorth.cashTotal,
              cashInBank: 100667,
              stocksIncludingCash:
                stateWithTransactions.netWorth.cashTotal.nonPensionStockValue +
                123 * 473 +
                165 +
                9965 +
                125 * 91 +
                449 +
                6694 -
                8455,
            },
          },
        };

        it('should take from the bank cash value', () => {
          expect.assertions(2);
          const result = getCashBreakdown(today)(stateWithSmallInvestableCash);

          expect(result.cashToInvest).toBe(0);
          expect(result.cashInBank).toBe(100667 + 165583 - 195621 - 8455);
        });
      });
    });
  });

  describe('getMaxAllocationTarget', () => {
    it('should return the remainder of the allocation after accounting for the given fund', () => {
      expect.assertions(2);

      const stateWithAllocation: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
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
