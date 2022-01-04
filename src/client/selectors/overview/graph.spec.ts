import { endOfDay, endOfMonth, getUnixTime } from 'date-fns';
import numericHash from 'string-hash';

import { getLongTermRates, getOverviewGraphValues } from './graph';
import { State } from '~client/reducers/types';
import { testState } from '~client/test-data';
import { LongTermOptions } from '~client/types';
import { PageListStandard } from '~client/types/gql';
import { PageNonStandard } from '~shared/constants';

const now = new Date('2018-03-23T11:54:23.127Z');
const today = endOfDay(now);

describe('getOverviewGraphValues', () => {
  const stateZeroed: State = {
    ...testState,
    overview: {
      ...testState.overview,
      startDate: new Date('2018-01-31'),
      endDate: new Date('2018-06-30'),
      monthly: {
        ...testState.overview.monthly,
        income: Array(6).fill(0),
        bills: Array(6).fill(0),
        food: Array(6).fill(0),
        general: Array(6).fill(0),
        holiday: Array(6).fill(0),
        social: Array(6).fill(0),
        investmentPurchases: Array(6).fill(0),
      },
      stocks: Array(3).fill(0),
      futureIncome: [],
      annualisedFundReturns: 0,
    },
    netWorth: {
      ...testState.netWorth,
      entries: [],
    },
    [PageNonStandard.Funds]: {
      ...testState[PageNonStandard.Funds],
      items: [],
      startTime: 0,
      cacheTimes: [],
      prices: {},
      todayPrices: {},
    },
  };

  describe('income values', () => {
    const stateForIncomeFutures: State = {
      ...stateZeroed,
      overview: {
        ...stateZeroed.overview,
        startDate: new Date('2017-12-31'),
        endDate: new Date('2018-06-30'),
        monthly: {
          ...stateZeroed.overview.monthly,
          [PageListStandard.Income]: [
            1234, // Dec-17
            5678, // Jan-18
            9012, // Feb-18
            3451, // Mar-18
          ],
        },
        futureIncome: [
          7890, // Mar-18
          1876, // Apr-18
          5432, // May-18
          1098, // Jun-18
        ],
      },
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [],
      },
    };

    describe('when long-term predictions are not enabled', () => {
      const longTermOptions = undefined;

      it('should use server-side predictions', () => {
        expect.assertions(1);
        const result = getOverviewGraphValues(today, 0, longTermOptions)(stateForIncomeFutures);

        expect(result.values[PageListStandard.Income]).toStrictEqual([
          1234, // Dec-17
          5678, // Jan-18
          9012, // Feb-18
          7890, // Mar-18 (predicted - current month)
          1876, // Apr-18 (predicted)
          5432, // May-18 (predicted)
          1098, // Jun-18 (predicted)
        ]);
      });

      it('should use the actual value when at the end of the month', () => {
        expect.assertions(1);
        const result = getOverviewGraphValues(
          endOfMonth(today),
          0,
          longTermOptions,
        )(stateForIncomeFutures);

        expect(result.values[PageListStandard.Income]).toStrictEqual([
          1234, // Dec-17
          5678, // Jan-18
          9012, // Feb-18
          3451, // Mar-18 (actual - current month)
          1876, // Apr-18 (predicted)
          5432, // May-18 (predicted)
          1098, // Jun-18 (predicted)
        ]);
      });
    });

    describe.each<
      [
        string,
        {
          longTermOptions: LongTermOptions;
          expectedValues: number[];
          expectedValuesEndOfMonth: number[];
        },
      ]
    >([
      [
        'with income',
        {
          longTermOptions: { enabled: true, rates: { years: 3, income: 1280 } },
          expectedValues: [
            1280 * 9, // Dec-18 (predicted)
            1280 * 12, // Dec-19 (predicted)
            1280 * 12, // Dec-20 (predicted)
          ],
          expectedValuesEndOfMonth: [
            1280 * 9, // Dec-18 (predicted)
            1280 * 12, // Dec-19 (predicted)
            1280 * 12, // Dec-20 (predicted)
          ],
        },
      ],
      [
        'without income',
        {
          longTermOptions: { enabled: true, rates: { years: 3, income: undefined } },
          expectedValues: [
            // exponential average of existing values
            Math.round(6948.2857142857 * 9), // Dec-18 (predicted)
            Math.round(6948.2857142857 * 12), // Dec-19 (predicted)
            Math.round(6948.2857142857 * 12), // Dec-20 (predicted)
          ],
          expectedValuesEndOfMonth: [
            // exponential average of existing values (including present month)
            Math.round(5083.0666666 * 9), // Dec-18 (predicted)
            Math.round(5083.0666666 * 12), // Dec-19 (predicted)
            Math.round(5083.0666666 * 12), // Dec-20 (predicted)
          ],
        },
      ],
    ])(
      'when long-term predictions are enabled %s',
      (_, { longTermOptions, expectedValues, expectedValuesEndOfMonth }) => {
        it('should use the income rate to predict income', () => {
          expect.assertions(1);
          const result = getOverviewGraphValues(today, 0, longTermOptions)(stateForIncomeFutures);

          expect(result.values[PageListStandard.Income]).toStrictEqual([
            1234, // Dec-17
            5678, // Jan-18
            9012, // Feb-18
            7890, // Mar-18 (predicted - current month)
            ...expectedValues,
          ]);
        });

        it('should use the actual present value when at the end of the month', () => {
          expect.assertions(1);
          const result = getOverviewGraphValues(
            endOfMonth(today),
            0,
            longTermOptions,
          )(stateForIncomeFutures);

          expect(result.values[PageListStandard.Income]).toStrictEqual([
            1234, // Dec-17
            5678, // Jan-18
            9012, // Feb-18
            3451, // Mar-18 (actual - current month)
            ...expectedValuesEndOfMonth,
          ]);
        });
      },
    );
  });

  describe('bills values', () => {
    const stateForBillsFutures: State = {
      ...stateZeroed,
      overview: {
        ...stateZeroed.overview,
        startDate: new Date('2017-12-31'),
        endDate: new Date('2018-06-30'),
        monthly: {
          ...stateZeroed.overview.monthly,
          bills: [105, 106, 15, 29, 430, 123, 152],
        },
      },
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [],
      },
    };

    describe('when long-term predictions are not enabled', () => {
      it('should take predictions straight from state', () => {
        expect.assertions(1);
        const graph = getOverviewGraphValues(today)(stateForBillsFutures);

        expect(graph.values[PageListStandard.Bills]).toStrictEqual([
          105, // Dec-17
          106, // Jan-18
          15, // Feb-18
          29, // Mar-18
          430, // Apr-18
          123, // May-18
          152, // Jun-18
        ]);
      });
    });

    describe('when long-term predictions are enabled', () => {
      it('should predict based on actual values', () => {
        expect.assertions(1);

        const graph = getOverviewGraphValues(today, 0, {
          enabled: true,
          rates: {
            years: 3,
          },
        })(stateForBillsFutures);

        expect(graph.values[PageListStandard.Bills]).toStrictEqual([
          105, // Dec-17
          106, // Jan-18
          15, // Feb-18
          29, // Mar-18,
          ((105 + 29) / 2) * 9, // Dec-18 (predict)
          ((105 + 29) / 2) * 12, // Dec-19 (predict)
          ((105 + 29) / 2) * 12, // Dec-20 (predict)
        ]);
      });
    });
  });

  describe.each<
    [
      PageListStandard,
      {
        stateValues: number[];
        expectedFutureValuesMiddle: number[];
        expectedFutureValuesEnd: number[];
        expectedPresentMonthPrediction: number;
      },
    ]
  >([
    [
      PageListStandard.Food,
      {
        stateValues: [43, 12, 7, 17],
        expectedPresentMonthPrediction: Math.round((17 * 31) / 23),
        expectedFutureValuesMiddle: [
          Math.round((12 + Math.round((17 * 31) / 23)) / 2), // Apr-18
          Math.round((12 + Math.round((17 * 31) / 23)) / 2), // May-18
          Math.round((12 + Math.round((17 * 31) / 23)) / 2), // Jun-18
        ],
        expectedFutureValuesEnd: [
          Math.round((12 + 17) / 2), // Apr-18
          Math.round((12 + 17) / 2), // May-18
          Math.round((12 + 17) / 2), // Jun-18
        ],
      },
    ],
    [
      PageListStandard.General,
      {
        stateValues: [105, 20, 2391, 5],
        expectedPresentMonthPrediction: 5, // don't extrapolate "general" items
        expectedFutureValuesMiddle: [
          Math.round((20 + 105) / 2), // Apr-18
          Math.round((20 + 105) / 2), // May-18
          Math.round((20 + 105) / 2), // Jun-18
        ],
        expectedFutureValuesEnd: [
          Math.round((20 + 105) / 2), // Apr-18
          Math.round((20 + 105) / 2), // May-18
          Math.round((20 + 105) / 2), // Jun-18
        ],
      },
    ],
    [
      PageListStandard.Holiday,
      {
        stateValues: [0, 0, 185553, 203],
        expectedPresentMonthPrediction: 203, // don't extrapolate "holiday" items
        expectedFutureValuesMiddle: [
          Math.round(203 / 2), // Apr-18
          Math.round(203 / 2), // May-18
          Math.round(203 / 2), // Jun-18
        ],
        expectedFutureValuesEnd: [
          Math.round(203 / 2), // Apr-18
          Math.round(203 / 2), // May-18
          Math.round(203 / 2), // Jun-18
        ],
      },
    ],
    [
      PageListStandard.Social,
      {
        stateValues: [20, 11, 329, 55],
        expectedPresentMonthPrediction: Math.round((55 * 31) / 23),
        expectedFutureValuesMiddle: [
          Math.round((20 + Math.round((55 * 31) / 23)) / 2), // Apr-18
          Math.round((20 + Math.round((55 * 31) / 23)) / 2), // May-18
          Math.round((20 + Math.round((55 * 31) / 23)) / 2), // Jun-18
        ],
        expectedFutureValuesEnd: [
          Math.round((20 + 55) / 2), // Apr-18
          Math.round((20 + 55) / 2), // May-18
          Math.round((20 + 55) / 2), // Jun-18
        ],
      },
    ],
  ])(
    '%s values',
    (
      page,
      {
        stateValues,
        expectedPresentMonthPrediction,
        expectedFutureValuesMiddle,
        expectedFutureValuesEnd,
      },
    ) => {
      const stateForSpendingValues: State = {
        ...stateZeroed,
        overview: {
          ...stateZeroed.overview,
          startDate: new Date('2017-12-31'),
          endDate: new Date('2018-06-30'),
          monthly: {
            ...stateZeroed.overview.monthly,
            [page]: stateValues,
          },
        },
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [],
        },
      };

      describe('when in the middle of the month', () => {
        it('should predict from and including the present month, using median values', () => {
          expect.assertions(1);
          const graph = getOverviewGraphValues(today, 0)(stateForSpendingValues);

          expect(graph.values[page]).toStrictEqual([
            stateValues[0], // Dec-17
            stateValues[1], // Jan-18
            stateValues[2], // Feb-18
            expectedPresentMonthPrediction, // Mar-18
            expectedFutureValuesMiddle[0], // Apr-18
            expectedFutureValuesMiddle[1], // May-18
            expectedFutureValuesMiddle[2], // Jun-18
          ]);
        });
      });

      describe('when at the end of the month', () => {
        it('should predict from but excluding the present month, using median values', () => {
          expect.assertions(1);
          const graph = getOverviewGraphValues(endOfMonth(today))(stateForSpendingValues);

          expect(graph.values[page]).toStrictEqual([
            stateValues[0], // Dec-17
            stateValues[1], // Jan-18
            stateValues[2], // Feb-18
            stateValues[3], // Mar-18
            expectedFutureValuesEnd[0], // Apr-18
            expectedFutureValuesEnd[1], // May-18
            expectedFutureValuesEnd[2], // Jun-18
          ]);
        });
      });
    },
  );

  describe('spending values', () => {
    const stateForSpendingValues: State = {
      ...stateZeroed,
      overview: {
        ...stateZeroed.overview,
        startDate: new Date('2017-12-31'),
        endDate: new Date('2018-06-30'),
        monthly: {
          ...stateZeroed.overview.monthly,
          [PageListStandard.Bills]: [100, 154, 128, 133, 165, 610, 293],
          [PageListStandard.Food]: [34, 12, 19, 25],
          [PageListStandard.General]: [10, 1552, 293, 93],
          [PageListStandard.Holiday]: [52, 0, 2003, 10],
          [PageListStandard.Social]: [94, 12, 29, 13],
        },
      },
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [],
      },
    };

    it('should sum bills, food, general, holiday and social values', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)(stateForSpendingValues);

      const expectedPredictedFood = Math.round((19 + Math.round((25 * 31) / 23)) / 2);
      const expectedPredictedGeneral = Math.round((93 + 293) / 2);
      const expectedPredictedHoliday = Math.round((10 + 52) / 2);
      const expectedPredictedSocial = Math.round((Math.round((13 * 31) / 23) + 29) / 2);

      const expectedPredictedSpending =
        expectedPredictedFood +
        expectedPredictedGeneral +
        expectedPredictedHoliday +
        expectedPredictedSocial;

      expect(result.values.spending).toStrictEqual([
        100 + 34 + 10 + 52 + 94, // Dec-17
        154 + 12 + 1552 + 0 + 12, // Jan-18
        128 + 19 + 293 + 2003 + 29, // Feb-18
        // Mar-18
        133 + // bills
          Math.round((25 * 31) / 23) + // food
          93 + // general
          10 + // holiday
          Math.round((13 * 31) / 23), // social
        expectedPredictedSpending + 165, // Apr-18
        expectedPredictedSpending + 610, // May-18
        expectedPredictedSpending + 293, // Jun-18
      ]);
    });
  });

  describe('liquid cash values', () => {
    it('should sum cash (easy access) values from the net worth entries up to the current month', () => {
      // Check ~client/test-data/state.ts to verify the category/subcategory ID associations
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-01-30'),
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 125000,
                },
                {
                  // this should be ignored
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  simple: 1293,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-02-28'),
              values: [
                {
                  subcategory: numericHash('real-wallet-subcategory-id'),
                  fx: [{ currency: 'CZK', value: 6650.32 }],
                },
              ],
              creditLimit: [],
              currencies: [{ currency: 'CZK', rate: 0.035 }],
            },
            {
              id: numericHash('entry-C'),
              date: new Date('2018-03-30'),
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 135000,
                },
                {
                  subcategory: numericHash('real-wallet-subcategory-id'),
                  fx: [{ currency: 'CZK', value: 152 }],
                },
              ],
              creditLimit: [],
              currencies: [{ currency: 'CZK', rate: 0.037 }],
            },
          ],
        },
      });

      expect(result.values.cashLiquid).toStrictEqual([
        125000, // Jan-18
        Math.round(6650.32 * 0.035 * 100), // Feb-18
        Math.round(135000 + 152 * 0.037 * 100), // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    const stateForLiquidCash: State = {
      ...stateZeroed,
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [
          {
            id: numericHash('entry-A'),
            date: new Date('2018-03-31'),
            values: [
              {
                subcategory: numericHash('real-bank-subcategory-id'),
                simple: 125000,
              },
            ],
            creditLimit: [],
            currencies: [],
          },
        ],
      },
    };

    it('should add income values to the predicted liquid cash', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        overview: {
          ...stateZeroed.overview,
          futureIncome: [
            123000, // Mar-18
            124500, // Apr-18
            137000, // May-18
            103000, // Jun-18
          ],
        },
      });

      expect(result.values.cashLiquid).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        125000, // Mar-18
        125000 + 124500, // Apr-18
        125000 + 124500 + 137000, // May-18
        125000 + 124500 + 137000 + 103000, // Jun-18
      ]);
    });

    it('should add predicted fund costs', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        overview: {
          ...stateZeroed.overview,
          monthly: {
            ...stateZeroed.overview.monthly,
            investmentPurchases: [
              160, // Jan-18
              254, // Feb-18
              224, // Mar-18
              0, // Apr-18
              0, // May-18
              0, // Jun-18
            ],
          },
        },
      });

      const expectedMonthlyStockPurchase = (160 + 254 + 224) / 3;

      expect(result.values.cashLiquid).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        125000, // Mar-18
        Math.round(125000 - expectedMonthlyStockPurchase), // Apr-18
        Math.round(125000 - expectedMonthlyStockPurchase * 2), // May-18
        Math.round(125000 - expectedMonthlyStockPurchase * 3), // Jun-18
      ]);
    });

    it('should add actual fund costs', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        [PageNonStandard.Funds]: {
          ...stateZeroed[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('my-fund'),
              item: 'My fund',
              transactions: [
                {
                  date: new Date('2018-05-18'),
                  units: 104,
                  price: 44.29,
                  taxes: 13,
                  fees: 19,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
            },
          ],
        },
      });

      expect(result.values.cashLiquid).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        125000, // Mar-18
        125000, // Apr-18
        Math.round(125000 - (104 * 44.29 + 13 + 19)), // May-18
        Math.round(125000 - (104 * 44.29 + 13 + 19)), // Jun-18
      ]);
    });

    it('should add bills costs', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        overview: {
          ...stateZeroed.overview,
          monthly: {
            ...stateZeroed.overview.monthly,
            bills: [
              150, // Jan-18
              104, // Feb-18
              92, // Mar-18
              120, // Apr-18
              98, // May-18
              43, // Jun-18
            ],
          },
        },
      });

      expect(result.values.cashLiquid).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        125000, // Mar-18
        125000 - 120, // Apr-18
        125000 - 120 - 98, // May-18
        125000 - 120 - 98 - 43, // Jun-18
      ]);
    });

    it('should remove credit card debt', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        netWorth: {
          ...stateForLiquidCash.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 125000,
                },
                {
                  subcategory: numericHash('real-credit-card-subcategory-id'),
                  simple: -56132,
                },
              ],
              currencies: [],
              creditLimit: [],
            },
          ],
        },
      });

      expect(result.values.cashLiquid).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        125000 - 56132, // Mar-18
        125000 - 56132, // Apr-18
        125000 - 56132, // May-18
        125000 - 56132, // Jun-18
      ]);
    });

    it.each<
      [
        PageListStandard,
        {
          monthlyValues: number[];
          expectedCashLiquid: number[];
        },
      ]
    >([
      [
        PageListStandard.Food,
        {
          monthlyValues: [120, 150, 30, 0, 0, 0],
          expectedCashLiquid: [
            expect.any(Number), // Jan-18
            expect.any(Number), // Feb-18
            125000, // Mar-18
            125000 - 120, // Apr-18
            125000 - 120 * 2, // May-18
            125000 - 120 * 3, // Jun-18
          ],
        },
      ],
      [
        PageListStandard.General,
        {
          monthlyValues: [1543, 258, 92, 0, 0, 0],
          expectedCashLiquid: [
            expect.any(Number), // Jan-18
            expect.any(Number), // Feb-18
            125000, // Mar-18
            125000 - 258, // Apr-18
            125000 - 258 * 2, // May-18
            125000 - 258 * 3, // Jun-18
          ],
        },
      ],
      [
        PageListStandard.Holiday,
        {
          monthlyValues: [0, 2540, 25, 0, 0, 0],
          expectedCashLiquid: [
            expect.any(Number), // Jan-18
            expect.any(Number), // Feb-18
            125000, // Mar-18
            125000 - 25, // Apr-18
            125000 - 25 * 2, // May-18
            125000 - 25 * 3, // Jun-18
          ],
        },
      ],
      [
        PageListStandard.Social,
        {
          monthlyValues: [93, 76, 48, 0, 0, 0],
          expectedCashLiquid: [
            expect.any(Number), // Jan-18
            expect.any(Number), // Feb-18
            125000, // Mar-18
            125000 - 76, // Apr-18
            125000 - 76 * 2, // May-18
            125000 - 76 * 3, // Jun-18
          ],
        },
      ],
    ])('should add %s costs', (page, { monthlyValues, expectedCashLiquid }) => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateForLiquidCash,
        overview: {
          ...stateZeroed.overview,
          monthly: {
            ...stateZeroed.overview.monthly,
            [page]: monthlyValues,
          },
        },
      });

      expect(result.values.cashLiquid).toStrictEqual(expectedCashLiquid);
    });
  });

  describe('other cash values', () => {
    it('should sum cash (other) values from the net worth entries up to the current month', () => {
      // Check ~client/test-data/state.ts to verify the category/subcategory ID associations
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-01-30'),
              values: [
                {
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  simple: 1293,
                },
                {
                  // this should be ignored
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 125000,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-02-28'),
              values: [
                {
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  fx: [{ currency: 'CZK', value: 6650.32 }],
                },
              ],
              creditLimit: [],
              currencies: [{ currency: 'CZK', rate: 0.035 }],
            },
            {
              id: numericHash('entry-C'),
              date: new Date('2018-03-30'),
              values: [
                {
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  simple: 135000,
                },
              ],
              creditLimit: [],
              currencies: [{ currency: 'CZK', rate: 0.037 }],
            },
          ],
        },
      });

      expect(result.values.cashOther).toStrictEqual([
        1293, // Jan-18
        Math.round(6650.32 * 0.035 * 100), // Feb-18
        Math.round(135000), // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    it('should predict cash saved in SAYE accounts', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-02-28'),
              values: [
                {
                  subcategory: numericHash('real-saye-subcategory-id'),
                  option: {
                    units: 15000,
                    vested: 5000,
                    strikePrice: 1350,
                    marketPrice: 2155,
                  },
                },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-03-31'),
              values: [
                {
                  subcategory: numericHash('real-saye-subcategory-id'),
                  option: {
                    units: 15000,
                    vested: 5500,
                    strikePrice: 1350,
                    marketPrice: 2155,
                  },
                },
                {
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  simple: 156620,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          ],
        },
      });

      expect(result.values.cashOther).toStrictEqual([
        0, // Jan-18
        5000 * 1350, // Feb-18
        156620 + 5500 * 1350, // Mar-18
        156620 + 6000 * 1350, // Apr-18
        156620 + 6500 * 1350, // May-18
        156620 + 7000 * 1350, // Jun-18
      ]);
    });

    it('should infer the cash balance in investment accounts and add that', () => {
      expect.assertions(2);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        overview: {
          ...stateZeroed.overview,
          stocks: [
            150175, // Jan-18
            150774, // Feb-18
            150284, // Mar-18
          ],
          annualisedFundReturns: 0.035, // this shouldn't affect it
        },
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              values: [
                {
                  subcategory: numericHash('real-locked-cash-subcategory-id'),
                  simple: 35000,
                },
                {
                  subcategory: numericHash('real-stocks-subcategory-id'),
                  simple: 150284 + 30654,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          ],
        },
        [PageNonStandard.Funds]: {
          ...stateZeroed[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('my-fund'),
              item: 'My fund',
              transactions: [
                {
                  date: new Date('2014-10-30'),
                  units: 350,
                  price: 501.32,
                  taxes: 0,
                  fees: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
            },
          ],
          startTime: getUnixTime(new Date('2018-03-20T11:30:19Z')),
          cacheTimes: [0],
          prices: {
            [numericHash('my-fund')]: [
              {
                startIndex: 0,
                values: [(150284 + 256) / 350],
              },
            ],
          },
        },
      });

      expect(result.values.cashOther).toStrictEqual([
        0, // Jan-18
        0, // Feb-18
        35000 + (150284 + 30654) - (150284 + 256), // Mar-18
        35000 + (150284 + 30654) - (150284 + 256), // Apr-18
        35000 + (150284 + 30654) - (150284 + 256), // May-18
        35000 + (150284 + 30654) - (150284 + 256), // Jun-18
      ]);
      expect(result.values.cashOther).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          65398,
          65398,
          65398,
          65398,
        ]
      `);
    });
  });

  describe('stock values', () => {
    const stateWithCurrentStockValue: State = {
      ...stateZeroed,
      overview: {
        ...stateZeroed.overview,
        stocks: [16900, 17200, 17000],
      },
      [PageNonStandard.Funds]: {
        ...stateZeroed[PageNonStandard.Funds],
        items: [
          {
            id: numericHash('fund-A'),
            item: 'Fund A',
            transactions: [
              {
                date: new Date('2010-05-10'),
                units: 104,
                price: 51.93,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
            ],
            stockSplits: [],
          },
          {
            id: numericHash('fund-B'),
            item: 'Fund B',
            transactions: [
              {
                date: new Date('2012-09-03'),
                units: 120,
                price: 87.54,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
            ],
            stockSplits: [],
          },
        ],
        startTime: getUnixTime(new Date('2016-02-03T11:01:30Z')),
        cacheTimes: [
          0,
          getUnixTime(new Date('2019-03-20T10:10:01Z')) -
            getUnixTime(new Date('2016-02-03T11:01:30Z')),
        ],
        prices: {
          [numericHash('fund-A')]: [{ startIndex: 1, values: [55.4] }],
          [numericHash('fund-B')]: [{ startIndex: 0, values: [90.3, 95.22] }],
        },
        todayPrices: {
          [numericHash('fund-B')]: 97.39,
        },
      },
    };

    const expectedLatestValue = 104 * 55.4 + 120 * 97.39;

    it('should predict the future stock values based on the calculated XIRR', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateWithCurrentStockValue.overview,
          annualisedFundReturns: 0.174,
        },
      });

      expect(result.values.stocks).toStrictEqual([
        16900, // Jan-18
        17200, // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(expectedLatestValue * 1.174 ** (1 / 12)), // Apr-18
        Math.round(expectedLatestValue * 1.174 ** (2 / 12)), // May-18
        Math.round(expectedLatestValue * 1.174 ** (3 / 12)), // Jun-18
      ]);
    });

    it('should exclude pension transactions', () => {
      expect.assertions(1);
      const resultWithPension = getOverviewGraphValues(today)({
        ...stateWithCurrentStockValue,
        [PageNonStandard.Funds]: {
          ...stateWithCurrentStockValue[PageNonStandard.Funds],
          items: [
            {
              ...stateWithCurrentStockValue[PageNonStandard.Funds].items[0],
              transactions: [
                ...stateWithCurrentStockValue[PageNonStandard.Funds].items[0].transactions,
                {
                  date: new Date('2010-07-03'),
                  units: 52,
                  price: 53.28,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: true,
                },
              ],
            },
            ...stateWithCurrentStockValue[PageNonStandard.Funds].items.slice(1),
          ],
        },
      });
      const resultWithoutPension = getOverviewGraphValues(today)(stateWithCurrentStockValue);

      expect(resultWithPension.values.stocks).toStrictEqual(resultWithoutPension.values.stocks);
    });

    it('should predict the future stock values based on extrapolated investments', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateZeroed.overview,
          monthly: {
            ...stateZeroed.overview.monthly,
            investmentPurchases: [2500, 1380, 1500],
          },
        },
      });

      const expectedInvestments = (2500 + 1380) / 2;

      expect(result.values.stocks).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(expectedLatestValue + expectedInvestments), // Apr-18
        Math.round(expectedLatestValue + expectedInvestments * 2), // May-18
        Math.round(expectedLatestValue + expectedInvestments * 3), // May-18
      ]);
    });

    it('should predict the future stock values based on combined investments and XIRR', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateZeroed.overview,
          annualisedFundReturns: 0.174,
          monthly: {
            ...stateZeroed.overview.monthly,
            investmentPurchases: [2500, 1380, 1500],
          },
        },
      });

      const expectedInvestments = (2500 + 1380) / 2;

      expect(result.values.stocks).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(expectedLatestValue * 1.174 ** (1 / 12) + expectedInvestments), // Apr-18
        Math.round(
          (expectedLatestValue * 1.174 ** (1 / 12) + expectedInvestments) * 1.174 ** (1 / 12) +
            expectedInvestments,
        ), // May-18
        Math.round(
          ((expectedLatestValue * 1.174 ** (1 / 12) + expectedInvestments) * 1.174 ** (1 / 12) +
            expectedInvestments) *
            1.174 ** (1 / 12) +
            expectedInvestments,
        ), // May-18
      ]);
    });

    it('should predict the future stock values based on long-term presumed XIRR', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          xirr: 0.085,
          years: 3,
        },
      })({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateZeroed.overview,
          annualisedFundReturns: 0.174, // should be ignored
        },
      });

      expect(result.values.stocks).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(expectedLatestValue * 1.085 ** (9 / 12)), // Dec-18
        Math.round(expectedLatestValue * 1.085 ** (9 / 12 + 1)), // Dec-19
        Math.round(expectedLatestValue * 1.085 ** (9 / 12 + 2)), // Dec-20
      ]);
    });

    it('should predict the future stock values based on long-term presumed investments', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          xirr: 0,
          stockPurchase: 2550,
          years: 3,
        },
      })({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateZeroed.overview,
          annualisedFundReturns: 0.174, // should be ignored
        },
      });

      expect(result.values.stocks).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(expectedLatestValue + 2550 * 9), // Dec-18
        Math.round(expectedLatestValue + 2550 * (9 + 12)), // Dec-19
        Math.round(expectedLatestValue + 2550 * (9 + 12 * 2)), // Dec-20
      ]);
    });

    it('should predict the future stock values based on combined long-term presumed investments and XIRR', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          xirr: 0.085,
          stockPurchase: 2550,
          years: 3,
        },
      })({
        ...stateWithCurrentStockValue,
        overview: {
          ...stateZeroed.overview,
          annualisedFundReturns: 0.174, // should be ignored
        },
      });

      expect(result.values.stocks).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        Math.round(expectedLatestValue), // Mar-18
        Math.round(
          ((((((((expectedLatestValue * 1.085 ** (1 / 12) + 2550) * 1.085 ** (1 / 12) + 2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550) *
            1.085 ** (1 / 12) +
            2550,
        ), // Dec-18
        expect.any(Number), // Dec-19
        expect.any(Number), // Dec-20
      ]);
    });
  });

  describe('stock cost basis', () => {
    const stateForStockCostBasis: State = {
      ...stateZeroed,
      overview: {
        ...stateZeroed.overview,
        monthly: {
          ...stateZeroed.overview.monthly,
          investmentPurchases: [1562, 33492, 25220],
        },
      },
      [PageNonStandard.Funds]: {
        ...stateZeroed[PageNonStandard.Funds],
        items: [
          {
            id: numericHash('fund-A'),
            item: 'My fund',
            transactions: [
              {
                date: new Date('2014-10-30'),
                units: 451,
                price: 55.19,
                fees: 0,
                taxes: 0,
                pension: false,
                drip: false,
              },
            ],
            stockSplits: [],
          },
          {
            id: numericHash('fund-B'),
            item: 'Other fund',
            transactions: [
              {
                date: new Date('2017-11-10'),
                units: 104,
                price: 83.22,
                fees: 0,
                taxes: 0,
                pension: false,
                drip: false,
              },
            ],
            stockSplits: [],
          },
        ],
      },
    };

    it('should include and predict the cost basis based on extrapolated investments', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)(stateForStockCostBasis);

      expect(result.values.stockCostBasis).toStrictEqual([
        Math.round(451 * 55.19 + 104 * 83.22), // Jan-18
        Math.round(451 * 55.19 + 104 * 83.22), // Feb-18
        Math.round(451 * 55.19 + 104 * 83.22 + (1562 + 33492) / 2), // Mar-18
        Math.round(451 * 55.19 + 104 * 83.22 + ((1562 + 33492) / 2) * 2), // Apr-18
        Math.round(451 * 55.19 + 104 * 83.22 + ((1562 + 33492) / 2) * 3), // May-18
        Math.round(451 * 55.19 + 104 * 83.22 + ((1562 + 33492) / 2) * 4), // Jun-18
      ]);
    });

    it('should predict based on long-term investment assumptions', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          years: 3,
          stockPurchase: 250000,
        },
      })(stateForStockCostBasis);

      expect(result.values.stockCostBasis).toStrictEqual([
        Math.round(451 * 55.19 + 104 * 83.22), // Jan-18
        Math.round(451 * 55.19 + 104 * 83.22), // Feb-18
        Math.round(451 * 55.19 + 104 * 83.22 + 250000), // Mar-18
        Math.round(451 * 55.19 + 104 * 83.22 + 250000 * 10), // Dec-18
        Math.round(451 * 55.19 + 104 * 83.22 + 250000 * (10 + 12)), // Dec-19
        Math.round(451 * 55.19 + 104 * 83.22 + 250000 * (10 + 12 * 2)), // Dec-20
      ]);
    });

    it('should include the specified number of extra months at the beginning', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 5)(stateForStockCostBasis);

      expect(result.values.stockCostBasis).toStrictEqual([
        Math.round(451 * 55.19), // Aug-17
        Math.round(451 * 55.19), // Sep-17
        Math.round(451 * 55.19), // Oct-17
        Math.round(451 * 55.19 + 104 * 83.22), // Nov-17
        Math.round(451 * 55.19 + 104 * 83.22), // Dec-17
        Math.round(451 * 55.19 + 104 * 83.22), // Jan-18
        Math.round(451 * 55.19 + 104 * 83.22), // Feb-18
        Math.round(451 * 55.19 + 104 * 83.22 + (1562 + 33492) / 2), // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    it.each`
      case      | pension  | drip
      ${'SIPP'} | ${true}  | ${false}
      ${'DRIP'} | ${false} | ${true}
    `('should exclude $case stock transactions', ({ pension, drip }) => {
      expect.assertions(1);
      const resultWithoutExtraTransaction = getOverviewGraphValues(today)(stateForStockCostBasis);
      const resultWithExtraTransaction = getOverviewGraphValues(today)({
        ...stateForStockCostBasis,
        [PageNonStandard.Funds]: {
          ...stateForStockCostBasis[PageNonStandard.Funds],
          items: [
            {
              ...stateForStockCostBasis[PageNonStandard.Funds].items[0],
              transactions: [
                ...stateForStockCostBasis[PageNonStandard.Funds].items[0].transactions,
                {
                  date: new Date('2014-11-10'),
                  units: 105,
                  price: 56.23,
                  fees: 0,
                  taxes: 0,
                  pension,
                  drip,
                },
              ],
            },
            ...stateForStockCostBasis[PageNonStandard.Funds].items.slice(1),
          ],
        },
      });

      expect(resultWithExtraTransaction.values.stockCostBasis).toStrictEqual(
        resultWithoutExtraTransaction.values.stockCostBasis,
      );
    });
  });

  describe('option values', () => {
    it('should include and continue the vested value of options', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              values: [
                {
                  subcategory: numericHash('real-option-subcategory-id'),
                  option: {
                    units: 1000,
                    vested: 254,
                    strikePrice: 156.23,
                    marketPrice: 205.97,
                  },
                },
              ],
              currencies: [],
              creditLimit: [],
            },
          ],
        },
      });

      expect(result.values.options).toStrictEqual([
        0, // Jan-18
        0, // Feb-18
        Math.round(254 * (205.97 - 156.23)), // Mar-18
        Math.round(254 * (205.97 - 156.23)), // Apr-18
        Math.round(254 * (205.97 - 156.23)), // May-18
        Math.round(254 * (205.97 - 156.23)), // Jun-18
      ]);
    });
  });

  describe('illiquid equity', () => {
    // There are more thorough tests of this in ./net-worth
    const stateForIlliquidEquity: State = {
      ...stateZeroed,
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [
          {
            id: numericHash('entry-A'),
            date: new Date('2018-03-31'),
            creditLimit: [],
            currencies: [],
            values: [
              {
                subcategory: numericHash('real-house-subcategory-id'),
                simple: 44000000,
              },
              {
                subcategory: numericHash('real-mortgage-subcategory-id'),
                loan: {
                  principal: 34500000,
                  rate: 2.8,
                  paymentsRemaining: 310,
                },
              },
            ],
          },
        ],
      },
    };

    // PMT function
    const expectedMonthlyPayment =
      ((1.028 ** (1 / 12) - 1) * 34500000) / (1 - (1.028 ** (1 / 12)) ** -310);

    it('should include and predict values', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)(stateForIlliquidEquity);

      expect(result.values.illiquidEquity).toStrictEqual([
        0, // Jan-18
        0, // Feb-18
        44000000 - 34500000, // Mar-18
        Math.round(
          44000000 * 1.05 ** (1 / 12) - (34500000 * 1.028 ** (1 / 12) - expectedMonthlyPayment),
        ), // Mar-18
        Math.round(
          44000000 * 1.05 ** (2 / 12) -
            ((34500000 * 1.028 ** (1 / 12) - expectedMonthlyPayment) * 1.028 ** (1 / 12) -
              expectedMonthlyPayment),
        ), // Apr-18
        Math.round(
          44000000 * 1.05 ** (3 / 12) -
            (((34500000 * 1.028 ** (1 / 12) - expectedMonthlyPayment) * 1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment),
        ), // Apr-18
      ]);
    });

    it('should predict long-term values', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          years: 3,
        },
      })(stateForIlliquidEquity);

      expect(result.values.illiquidEquity).toStrictEqual([
        0, // Jan-18
        0, // Feb-18
        44000000 - 34500000, // Mar-18
        Math.round(
          44000000 * 1.05 ** (9 / 12) -
            (((((((((34500000 * 1.028 ** (1 / 12) - expectedMonthlyPayment) * 1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment) *
              1.028 ** (1 / 12) -
              expectedMonthlyPayment),
        ), // Dec-18
        expect.any(Number), // Dec-19
        expect.any(Number), // Jan-19
      ]);
    });
  });

  describe('pension values', () => {
    const stateForPension: State = {
      ...stateZeroed,
      netWorth: {
        ...stateZeroed.netWorth,
        entries: [
          {
            id: numericHash('entry-A'),
            date: new Date('2018-03-31'),
            creditLimit: [],
            currencies: [],
            values: [
              {
                subcategory: numericHash('real-pension-subcategory-id'),
                simple: 104523,
              },
            ],
          },
        ],
      },
    };

    it('should include net worth pension values', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)(stateForPension);

      expect(result.values.pension).toStrictEqual([
        0, // Jan-18
        0, // Feb-18
        104523, // Mar-18
        104523, // Apr-18
        104523, // May-18
        104523, // Jun-18
      ]);
    });
  });

  describe('assets values', () => {
    it('should sum all assets from the net worth entries', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-01-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
                {
                  subcategory: numericHash('real-wallet-subcategory-id'),
                  simple: 5562,
                },
              ],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-02-28'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 49119,
                },
              ],
            },
          ],
        },
      });

      expect(result.values.assets).toStrictEqual([
        1500325 + 5562, // Jan-18
        49119, // Feb-18
        expect.any(Number), // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    it('should exclude option values', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
                {
                  subcategory: numericHash('real-option-subcategory-id'),
                  option: {
                    units: 1000,
                    vested: 400,
                    strikePrice: 105,
                    marketPrice: 109,
                  },
                },
              ],
            },
          ],
        },
      });

      expect(result.values.assets).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        1500325, // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    it('should add stock returns for predicted months', () => {
      expect.assertions(5);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        overview: {
          ...stateZeroed.overview,
          annualisedFundReturns: 0.21,
          stocks: [7500000, 7513025, 7499729],
        },
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
              ],
            },
          ],
        },
        [PageNonStandard.Funds]: {
          ...stateZeroed[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('my-fund'),
              item: 'My fund',
              transactions: [
                {
                  date: new Date('2014-01-03'),
                  units: 175000,
                  price: 40.13,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
            },
          ],
          startTime: getUnixTime(new Date('2018-03-21T05:30:11Z')),
          cacheTimes: [0],
          prices: {
            [numericHash('my-fund')]: [{ startIndex: 0, values: [46.23] }],
          },
        },
      });

      // Assert that the stocks actually do provide a non-negative change
      expect(result.values.stocks[2]).not.toBe(result.values.stocks[3]);
      expect(result.values.stocks[3]).not.toBe(result.values.stocks[4]);
      expect(result.values.stocks[4]).not.toBe(result.values.stocks[5]);

      expect(result.values.assets).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        1500325, // Mar-18
        1500325 + result.values.stocks[3] - result.values.stocks[2], // Apr-18
        1500325 + result.values.stocks[4] - result.values.stocks[2], // May-18
        1500325 + result.values.stocks[5] - result.values.stocks[2], // Jun-18
      ]);

      expect(result.values.assets).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          1500325,
          1629865,
          1761479,
          1895201,
        ]
      `);
    });

    it('should add assumed solid asset appreciation for predicted months', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
                {
                  subcategory: numericHash('real-house-subcategory-id'),
                  simple: 40000000,
                },
                {
                  subcategory: numericHash('real-mortgage-subcategory-id'),
                  loan: {
                    principal: 36000000,
                    rate: 2.5,
                    paymentsRemaining: 330,
                  },
                },
              ],
            },
          ],
        },
      });

      // The 5% rate of inflation here is set in the net worth subcategory definition (see ~client/test-data/state.ts)
      expect(result.values.assets).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        1500325 + 40000000, // Mar-18
        Math.round(1500325 + 40000000 * 1.05 ** (1 / 12)), // Apr-18
        Math.round(1500325 + 40000000 * 1.05 ** (2 / 12)), // May-18
        Math.round(1500325 + 40000000 * 1.05 ** (3 / 12)), // Jun-18
      ]);
    });

    it('should add any liquid cash changes for predicted months', () => {
      expect.assertions(5);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        overview: {
          ...stateZeroed.overview,
          futureIncome: [640000, 490000, 550000, 620000],
        },
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
              ],
            },
          ],
        },
      });

      // Assert that the income actually do provide a non-negative change
      expect(result.values.cashLiquid[2]).not.toBe(result.values.cashLiquid[3]);
      expect(result.values.cashLiquid[3]).not.toBe(result.values.cashLiquid[4]);
      expect(result.values.cashLiquid[4]).not.toBe(result.values.cashLiquid[5]);

      expect(result.values.assets).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        1500325, // Mar-18
        1500325 + result.values.cashLiquid[3] - result.values.cashLiquid[2], // Apr-18
        1500325 + result.values.cashLiquid[4] - result.values.cashLiquid[2], // May-18
        1500325 + result.values.cashLiquid[5] - result.values.cashLiquid[2], // Jun-18
      ]);

      expect(result.values.assets).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          1500325,
          1990325,
          2540325,
          3160325,
        ]
      `);
    });

    it('should add any locked cash changes for predicted months', () => {
      expect.assertions(5);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-02-28'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-saye-subcategory-id'),
                  option: {
                    units: 1000,
                    vested: 400,
                    strikePrice: 1400,
                    marketPrice: 2410,
                  },
                },
              ],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-bank-subcategory-id'),
                  simple: 1500325,
                },
                {
                  subcategory: numericHash('real-saye-subcategory-id'),
                  option: {
                    units: 1000,
                    vested: 500,
                    strikePrice: 1400,
                    marketPrice: 2396,
                  },
                },
              ],
            },
          ],
        },
      });

      // Assert that the liquid cash actually does provide a non-negative change
      expect(result.values.cashOther[2]).not.toBe(result.values.cashOther[3]);
      expect(result.values.cashOther[3]).not.toBe(result.values.cashOther[4]);
      expect(result.values.cashOther[4]).not.toBe(result.values.cashOther[5]);

      expect(result.values.assets).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        1500325 + 500 * 1400, // Mar-18
        1500325 + 500 * 1400 + result.values.cashOther[3] - result.values.cashOther[2], // Apr-18
        1500325 + 500 * 1400 + result.values.cashOther[4] - result.values.cashOther[2], // May-18
        1500325 + 500 * 1400 + result.values.cashOther[5] - result.values.cashOther[2], // Jun-18
      ]);

      expect(result.values.assets).toMatchInlineSnapshot(`
        Array [
          0,
          560000,
          2200325,
          2340325,
          2480325,
          2620325,
        ]
      `);
    });
  });

  describe('liabilities values', () => {
    it('should sum all liabilities from the net worth entries', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-01-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-mortgage-subcategory-id'),
                  loan: {
                    principal: 36000000,
                    paymentsRemaining: 340,
                    rate: 2.3,
                  },
                },
                {
                  subcategory: numericHash('real-credit-card-subcategory-id'),
                  simple: -26523,
                },
              ],
            },
            {
              id: numericHash('entry-B'),
              date: new Date('2018-02-28'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-credit-card-subcategory-id'),
                  simple: -39612,
                },
              ],
            },
          ],
        },
      });

      expect(result.values.liabilities).toStrictEqual([
        -(36000000 + 26523), // Jan-18
        -39612, // Feb-18
        expect.any(Number), // Mar-18
        expect.any(Number), // Apr-18
        expect.any(Number), // May-18
        expect.any(Number), // Jun-18
      ]);
    });

    it('should add assumed debt repayments and interest for predicted months', () => {
      expect.assertions(1);
      const result = getOverviewGraphValues(today)({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-house-subcategory-id'),
                  simple: 40000000,
                },
                {
                  subcategory: numericHash('real-mortgage-subcategory-id'),
                  loan: {
                    principal: 36000000,
                    rate: 2.5,
                    paymentsRemaining: 330,
                  },
                },
              ],
            },
          ],
        },
      });

      const expectedMonthlyPayment = 150444.556159892; // PMT function

      expect(result.values.liabilities).toStrictEqual([
        expect.any(Number), // Jan-18
        expect.any(Number), // Feb-18
        -36000000, // Mar-18
        -Math.round(36000000 * 1.025 ** (1 / 12) - expectedMonthlyPayment), // Apr-18
        -Math.round(
          (36000000 * 1.025 ** (1 / 12) - expectedMonthlyPayment) * 1.025 ** (1 / 12) -
            expectedMonthlyPayment,
        ), // May-18
        -Math.round(
          ((36000000 * 1.025 ** (1 / 12) - expectedMonthlyPayment) * 1.025 ** (1 / 12) -
            expectedMonthlyPayment) *
            1.025 ** (1 / 12) -
            expectedMonthlyPayment,
        ), // Jun-18
      ]);
    });

    it('should predict the long-term loan debt correctly down to zero', () => {
      expect.assertions(2);
      const result = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: { years: 10 },
      })({
        ...stateZeroed,
        netWorth: {
          ...stateZeroed.netWorth,
          entries: [
            {
              id: numericHash('entry-A'),
              date: new Date('2018-03-31'),
              creditLimit: [],
              currencies: [],
              values: [
                {
                  subcategory: numericHash('real-house-subcategory-id'),
                  simple: 40000000,
                },
                {
                  subcategory: numericHash('real-mortgage-subcategory-id'),
                  loan: {
                    principal: 7600000,
                    rate: 2.5,
                    paymentsRemaining: 110, // nine years and two months
                  },
                },
              ],
            },
          ],
        },
      });

      expect(result.values.liabilities[2 + 10]).toBe(0);
      expect(result.values.liabilities).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          -7600000,
          -7040741,
          -6278766,
          -5497743,
          -4697194,
          -3876631,
          -3035554,
          -2173450,
          -1289794,
          -384046,
          0,
        ]
      `);
    });
  });

  describe('net worth values', () => {
    it('should sum assets with liabilities', () => {
      expect.assertions(4);
      const result = getOverviewGraphValues(today)(testState);

      expect(result.values.assets.every((value) => value === 0)).toBe(false);
      expect(result.values.liabilities.every((value) => value === 0)).toBe(false);

      expect(result.values.netWorth).toStrictEqual([
        result.values.assets[0] + result.values.liabilities[0], // Jan-18
        result.values.assets[1] + result.values.liabilities[1], // Feb-18
        result.values.assets[2] + result.values.liabilities[2], // Mar-18
        result.values.assets[3] + result.values.liabilities[3], // Apr-18
        result.values.assets[4] + result.values.liabilities[4], // May-18
        result.values.assets[5] + result.values.liabilities[5], // Jun-18
        result.values.assets[6] + result.values.liabilities[6], // Jul-18
      ]);

      expect(result.values.netWorth).toMatchInlineSnapshot(`
        Array [
          1680500,
          4501798,
          4248848,
          4795105,
          4931150,
          5067729,
          5204843,
        ]
      `);
    });
  });

  describe('the date list', () => {
    // This has more comprehensive tests in ./common.spec
    it('should be an end-of-month list based on the futureMonths and startDate value', () => {
      expect.assertions(1);
      const graph = getOverviewGraphValues(today)(testState);
      expect(graph.dates).toStrictEqual([
        new Date('2018-01-31T23:59:59.999Z'),
        new Date('2018-02-28T23:59:59.999Z'),
        new Date('2018-03-31T23:59:59.999Z'),
        new Date('2018-04-30T23:59:59.999Z'),
        new Date('2018-05-31T23:59:59.999Z'),
        new Date('2018-06-30T23:59:59.999Z'),
        new Date('2018-07-31T23:59:59.999Z'),
      ]);
    });

    it('should use the end of each year when making long term predictions', () => {
      expect.assertions(1);
      const graph = getOverviewGraphValues(today, 0, {
        enabled: true,
        rates: {
          years: 3,
        },
      })(testState);

      expect(graph.dates).toStrictEqual([
        new Date('2018-01-31T23:59:59.999Z'),
        new Date('2018-02-28T23:59:59.999Z'),
        new Date('2018-03-31T23:59:59.999Z'),
        new Date('2018-12-31T23:59:59.999Z'),
        new Date('2019-12-31T23:59:59.999Z'),
        new Date('2020-12-31T23:59:59.999Z'),
      ]);
    });
  });

  it('should return the start prediction index', () => {
    // This has more comprehensive tests in ./common.spec
    expect.assertions(4);
    // The data starts from Dec-17
    expect(getOverviewGraphValues(new Date('2018-01-05'))(testState).startPredictionIndex).toBe(1);
    expect(getOverviewGraphValues(new Date('2018-01-31'))(testState).startPredictionIndex).toBe(1);
    expect(getOverviewGraphValues(new Date('2018-02-25'))(testState).startPredictionIndex).toBe(2);
    expect(getOverviewGraphValues(new Date('2018-03-23'))(testState).startPredictionIndex).toBe(3);
  });
});

describe('getLongTermRates', () => {
  /*
   * Calculated by exponential average:
   * (1500 / 2 + 1900 / 4 + 2000 / 8) /
   * (1 / 2 + 1 / 4 + 1 / 8)
   */
  const expectedIncome = 1685.714;

  /*
   * Calculated by simple mean:
   * (20050 + 0 + 0) / 3
   */
  const expectedStockPurchase = 6683.333;

  it.each`
    thing              | value
    ${'income'}        | ${expectedIncome}
    ${'stockPurchase'} | ${expectedStockPurchase}
  `('should return the calculated average for $thing', ({ thing, value }) => {
    expect.assertions(1);
    const result = getLongTermRates(now, undefined)(testState);
    expect(result[thing as keyof LongTermOptions['rates']]).toBeCloseTo(value);
  });

  it('should combine given options with the rates', () => {
    expect.assertions(1);
    const result = getLongTermRates(now, {
      enabled: true,
      rates: {
        income: 1540,
      },
    })(testState);

    expect(result.income).toBe(1540);
  });

  it('should use default rates when the long term options are disabled', () => {
    expect.assertions(1);
    const result = getLongTermRates(now, {
      enabled: false,
      rates: {
        income: 1540,
      },
    })(testState);

    expect(result.income).toBeCloseTo(expectedIncome);
  });

  it('should return the enabled status', () => {
    expect.assertions(3);
    expect(getLongTermRates(now, undefined)(testState).enabled).toBe(false);
    expect(getLongTermRates(now, { enabled: true, rates: {} })(testState).enabled).toBe(true);
    expect(getLongTermRates(now, { enabled: false, rates: {} })(testState).enabled).toBe(false);
  });
});
