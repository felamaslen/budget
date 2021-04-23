import { endOfMonth, getUnixTime, isSameMonth } from 'date-fns';
import numericHash from 'string-hash';

import { getOverviewGraphValues, getOverviewTable, getLongTermRates } from '.';

import type { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data';
import type { LongTermOptions, OverviewGraphValues } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

describe('Overview selectors', () => {
  const now = new Date('2018-03-23T11:54:23.127Z');

  describe('getOverviewGraphValues', () => {
    const testState: State = {
      ...state,
      [PageNonStandard.Funds]: {
        ...state[PageNonStandard.Funds],
        items: [
          {
            id: numericHash('fund-A'),
            item: 'some fund 1',
            transactions: [
              {
                date: new Date('2018-02-05'),
                units: 10,
                price: 5612,
                fees: 3,
                taxes: 0,
                drip: false,
              },
              {
                date: new Date('2018-03-27'),
                units: -1.32,
                price: 1804,
                fees: 0.72,
                taxes: 0,
                drip: false,
              },
            ],
            stockSplits: [],
            allocationTarget: 0,
          },
          {
            id: numericHash('fund-B'),
            item: 'some fund 2',
            transactions: [
              {
                date: new Date('2018-03-17'),
                units: 51,
                price: 109,
                fees: 3,
                taxes: 0,
                drip: false,
              },
            ],
            stockSplits: [],
            allocationTarget: 0,
          },
        ],
        startTime: getUnixTime(new Date('2018-02-04')),
        cacheTimes: [
          86400 * 0,
          86400 * 1,
          86400 * 2,
          86400 * 3,
          86400 * 4,
          86400 * 5,
          86400 * 6,
          86400 * 7,
          86400 * 8,
          86400 * 9,
          86400 * 10,
        ],
        prices: {
          [numericHash('fund-A')]: [{ startIndex: 0, values: [4973 * 2, 4973 * 2, 4973] }],
          [numericHash('fund-B')]: [{ startIndex: 0, values: [113] }],
        },
      },
    };

    const assetsActual = [
      /* Jan-18 */ 21000000,
      /* Feb-18 */ 10324 + 37.5 * 0.035 * 100 + 855912 + 1296523 + 21000000 + 10654 + 657 * 123.6,
      /* Mar-18 */ 9752 + 11237 + 1051343 + 165 * 0.865 * 100 + 21500000 + 698 * 123.6 + 94 * 200.1,
      /* Apr-18 */ 0,
      /* May-18 */ 0,
      /* Jun-18 */ 0,
      /* Jul-18 */ 0,
    ];

    const liabilitiesActual = [
      /* Jan-18 */ -19319500,
      /* Feb-18 */ -(18744200 + 8751),
      /* Mar-18 */ -(18420900 + 21939),
      /* Apr-18 */ 0,
      /* May-18 */ 0,
      /* Jun-18 */ 0,
      /* Jul-18 */ 0,
    ];

    const expectedIncomeAverage = 1686; // (1500 / 2 + 1900 / 4 + 2000 / 8) / (1 / 2 + 1 / 4 + 1 / 8)
    const expectedStockPurchaseAverage = 20050 / 3;

    const mar18Transactions =
      /* fund-A Mar-27 transaction */ 1804 * 1.32 -
      0.72 -
      /* fund-B Mar-17 transaction */ (109 * 51 + 3);

    const stateWithoutCurrentMonth: State = {
      ...testState,
      netWorth: {
        ...testState.netWorth,
        entries: testState.netWorth.entries.filter((entry) => !isSameMonth(entry.date, now)),
      },
    };

    const illiquidAppreciation = 1.05; // check test state

    describe('when there is no net worth entry for the current month', () => {
      // Check the test data at src/client/test-data/state.ts to verify these assertions
      const currentFundsValue = 10 * 4973 + 51 * 113;

      const { annualisedFundReturns } = stateWithoutCurrentMonth[PageNonStandard.Overview];

      const stocksJan18 = 100779;
      const stocksFeb18 = 101459;
      const stocksMar18 = currentFundsValue;
      const stocksApr18 = currentFundsValue * (1 + annualisedFundReturns) ** (1 / 12);
      const stocksMay18 = stocksApr18 * (1 + annualisedFundReturns) ** (1 / 12);
      const stocksJun18 = stocksMay18 * (1 + annualisedFundReturns) ** (1 / 12);
      const stocksJul18 = stocksJun18 * (1 + annualisedFundReturns) ** (1 / 12);

      const stocks = [
        /* Jan-18 */ stocksJan18,
        /* Feb-18 */ stocksFeb18,
        /* Mar-18 */ stocksMar18,
        /* Apr-18 */ stocksApr18,
        /* May-18 */ stocksMay18,
        /* Jun-18 */ stocksJun18,
        /* Jul-18 */ stocksJul18,
      ];

      const stockCostBasis = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 10 * 5612 + 3,
        /* Mar-18 */ 10 * 5612 + 3 - 1.32 * 1804 + 0.72 + (51 * 109 + 3),
        /* Apr-18 */ 10 * 5612 + 3 - 1.32 * 1804 + 0.72 + (51 * 109 + 3),
        /* May-18 */ 10 * 5612 + 3 - 1.32 * 1804 + 0.72 + (51 * 109 + 3),
        /* Jun-18 */ 10 * 5612 + 3 - 1.32 * 1804 + 0.72 + (51 * 109 + 3),
        /* Jul-18 */ 10 * 5612 + 3 - 1.32 * 1804 + 0.72 + (51 * 109 + 3),
      ];

      const pension = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 10654,
        /* Mar-18 */ 10654,
        /* Apr-18 */ 10654,
        /* May-18 */ 10654,
        /* Jun-18 */ 10654,
        /* Jul-18 */ 10654,
      ];

      const cashOther = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 855912 + Math.round(657 * 123.6),
        /* Mar-18 */ 855912 + Math.round(657 * 123.6),
        /* Apr-18 */ 855912 + Math.round(657 * 123.6),
        /* May-18 */ 855912 + Math.round(657 * 123.6),
        /* Jun-18 */ 855912 + Math.round(657 * 123.6),
        /* Jul-18 */ 855912 + Math.round(657 * 123.6),
      ];

      const monthlyLoanPayment =
        ((1.0274 ** (1 / 12) - 1) * 18744200) / (1 - (1.0274 ** (1 / 12)) ** -(12 * 25 - 1));

      const illiquidValue = [
        /* Jan-18 */ 21000000,
        /* Feb-18 */ 21000000,
        /* Mar-18 */ 21000000 * illiquidAppreciation ** (1 / 12),
        /* Apr-18 */ 21000000 * illiquidAppreciation ** (2 / 12),
        /* May-18 */ 21000000 * illiquidAppreciation ** (3 / 12),
        /* Jun-18 */ 21000000 * illiquidAppreciation ** (4 / 12),
        /* Jul-18 */ 21000000 * illiquidAppreciation ** (5 / 12),
      ];

      const loanDebt = [
        /* Jan-18 */ -19319500,
        /* Feb-18 */ -18744200,
        /* Mar-18 */ -(18744200 * 1.0274 ** (1 / 12) - monthlyLoanPayment),
        /* Apr-18 */ -(
          (18744200 * 1.0274 ** (1 / 12) - monthlyLoanPayment) * 1.0274 ** (1 / 12) -
          monthlyLoanPayment
        ),
        /* May-18 */ -(
          ((18744200 * 1.0274 ** (1 / 12) - monthlyLoanPayment) * 1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
          monthlyLoanPayment
        ),
        /* Jun-18 */ -(
          (((18744200 * 1.0274 ** (1 / 12) - monthlyLoanPayment) * 1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
          monthlyLoanPayment
        ),
        /* Jul-18 */ -(
          ((((18744200 * 1.0274 ** (1 / 12) - monthlyLoanPayment) * 1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0274 ** (1 / 12) -
          monthlyLoanPayment
        ),
      ];

      const illiquidEquity = [
        /* Jan-18 */ illiquidValue[0] + loanDebt[0],
        /* Feb-18 */ illiquidValue[1] + loanDebt[1],
        /* Mar-18 */ illiquidValue[2] + loanDebt[2],
        /* Apr-18 */ illiquidValue[3] + loanDebt[3],
        /* May-18 */ illiquidValue[4] + loanDebt[4],
        /* Jun-18 */ illiquidValue[5] + loanDebt[5],
        /* Jul-18 */ illiquidValue[6] + loanDebt[6],
      ];

      const options = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 657 * (176.28 - 123.6),
        /* Mar-18 */ 657 * (176.28 - 123.6), // predict current month
        /* Apr-18 */ 657 * (176.28 - 123.6),
        /* May-18 */ 657 * (176.28 - 123.6),
        /* Jun-18 */ 657 * (176.28 - 123.6),
        /* Jul-18 */ 657 * (176.28 - 123.6),
      ];

      const income = [
        2000,
        1900,
        1500,
        expectedIncomeAverage,
        expectedIncomeAverage,
        expectedIncomeAverage,
        expectedIncomeAverage,
      ];
      const bills = [1000, 900, 400, 650, 0, 0, 0];
      const food = [50, 13, 27, 27, 27, 27, 27];
      const general = [150, 90, 10, 90, 90, 90, 90];
      const social = [50, 65, 181, 65, 65, 65, 65];
      const holiday = [10, 1000, 95, 95, 95, 95, 95];

      const spending = [
        /* Jan-18 */ 1000 + 50 + 150 + 50 + 10,
        /* Feb-18 */ 900 + 13 + 90 + 65 + 1000,
        /* Mar-18 */ 713,
        /* Apr-18 */ 277 + /* bills */ 650,
        /* May-18 */ 277,
        /* Jun-18 */ 277,
        /* Jul-18 */ 277,
      ];

      const assetsPredictedMar18 =
        assetsActual[1] +
        income[2] -
        spending[2] +
        stocks[2] -
        stocks[1] +
        mar18Transactions +
        illiquidValue[2] -
        illiquidValue[1] +
        cashOther[2] -
        cashOther[1];

      // We're currently in March, but not at the end of the month, so we predict the next
      // month's value based on the prediction for March
      const assetsPredictedApr18 =
        assetsPredictedMar18 +
        income[3] -
        spending[3] +
        stocks[3] -
        stocks[2] +
        illiquidValue[3] -
        illiquidValue[2] +
        cashOther[3] -
        cashOther[2];
      const assetsPredictedMay18 =
        assetsPredictedApr18 +
        income[4] -
        spending[4] +
        stocks[4] -
        stocks[3] +
        illiquidValue[4] -
        illiquidValue[3] +
        cashOther[4] -
        cashOther[3];
      const assetsPredictedJun18 =
        assetsPredictedMay18 +
        income[5] -
        spending[5] +
        stocks[5] -
        stocks[4] +
        illiquidValue[5] -
        illiquidValue[4] +
        cashOther[5] -
        cashOther[4];
      const assetsPredictedJul18 =
        assetsPredictedJun18 +
        income[6] -
        spending[6] +
        stocks[6] -
        stocks[5] +
        illiquidValue[6] -
        illiquidValue[5] +
        cashOther[6] -
        cashOther[5];

      const liabilitiesPredictedMar18 = liabilitiesActual[1] + loanDebt[2] - loanDebt[1];
      const liabilitiesPredictedApr18 = liabilitiesPredictedMar18 + loanDebt[3] - loanDebt[2];
      const liabilitiesPredictedMay18 = liabilitiesPredictedApr18 + loanDebt[4] - loanDebt[3];
      const liabilitiesPredictedJun18 = liabilitiesPredictedMay18 + loanDebt[5] - loanDebt[4];
      const liabilitiesPredictedJul18 = liabilitiesPredictedJun18 + loanDebt[6] - loanDebt[5];

      const assets = [
        /* Jan-18 */ assetsActual[0],
        /* Feb-18 */ assetsActual[1],
        /* Mar-18 */ assetsPredictedMar18,
        /* Apr-18 */ assetsPredictedApr18,
        /* May-18 */ assetsPredictedMay18,
        /* Jun-18 */ assetsPredictedJun18,
        /* Jul-18 */ assetsPredictedJul18,
      ];

      const liabilities = [
        /* Jan-18 */ liabilitiesActual[0],
        /* Feb-18 */ liabilitiesActual[1],
        /* Mar-18 */ liabilitiesPredictedMar18,
        /* Apr-18 */ liabilitiesPredictedApr18,
        /* May-18 */ liabilitiesPredictedMay18,
        /* Jun-18 */ liabilitiesPredictedJun18,
        /* Jul-18 */ liabilitiesPredictedJul18,
      ];

      // We include the current month's prediction in the combined list,
      // because we're not yet at the end of the month
      const netWorth = [
        /* Jan-18 */ assets[0] + liabilities[0],
        /* Feb-18 */ assets[1] + liabilities[1],
        /* Mar-18 */ assets[2] + liabilities[2],
        /* Apr-18 */ assets[3] + liabilities[3],
        /* May-18 */ assets[4] + liabilities[4],
        /* Jun-18 */ assets[5] + liabilities[5],
        /* Jul-18 */ assets[6] + liabilities[6],
      ];

      it.each`
        description                        | prop                | value
        ${'net worth (excluding options)'} | ${'netWorth'}       | ${netWorth}
        ${'assets'}                        | ${'assets'}         | ${assets}
        ${'liabilities'}                   | ${'liabilities'}    | ${liabilities}
        ${'investments (excluding cash)'}  | ${'stocks'}         | ${stocks}
        ${'investment cost basis'}         | ${'stockCostBasis'} | ${stockCostBasis}
        ${'pension'}                       | ${'pension'}        | ${pension}
        ${'other cash'}                    | ${'cashOther'}      | ${cashOther}
        ${'illiquid equity'}               | ${'illiquidEquity'} | ${illiquidEquity}
        ${'options'}                       | ${'options'}        | ${options}
        ${'income'}                        | ${'income'}         | ${income}
        ${'bills'}                         | ${'bills'}          | ${bills}
        ${'food'}                          | ${'food'}           | ${food}
        ${'general'}                       | ${'general'}        | ${general}
        ${'social'}                        | ${'social'}         | ${social}
        ${'holiday'}                       | ${'holiday'}        | ${holiday}
        ${'spending'}                      | ${'spending'}       | ${spending}
      `('should add values for $description', ({ prop, value }) => {
        expect.assertions(1);
        const { values: result } = getOverviewGraphValues(now, 0)(stateWithoutCurrentMonth);
        expect(result[prop as keyof OverviewGraphValues]).toStrictEqual(value.map(Math.round));
      });

      it('should return the date list', () => {
        expect.assertions(1);
        const result = getOverviewGraphValues(now, 0)(testState);
        expect(result.dates).toStrictEqual([
          new Date('2018-01-31T23:59:59.999Z'),
          new Date('2018-02-28T23:59:59.999Z'),
          new Date('2018-03-31T23:59:59.999Z'),
          new Date('2018-04-30T23:59:59.999Z'),
          new Date('2018-05-31T23:59:59.999Z'),
          new Date('2018-06-30T23:59:59.999Z'),
          new Date('2018-07-31T23:59:59.999Z'),
        ]);
      });

      it('should return the start prediction index', () => {
        expect.assertions(1);
        expect(getOverviewGraphValues(now, 0)(stateWithoutCurrentMonth).startPredictionIndex).toBe(
          2,
        );
      });

      describe('when showing old months', () => {
        it('should calculate the cost basis for the old months too', () => {
          expect.assertions(1);
          const processedWithOldMonths = getOverviewGraphValues(now, 11)(state);

          const costBasisMay17 =
            1117.87 * 80.510256 -
            1117.87 * 72.24453648 +
            (1499.7 * 133.36 - 1499.7 * 177.1167567) +
            (450 * 100 - 450 * 112 + 20 + 80) +
            (428 * 934 + 148 + 100);

          expect(processedWithOldMonths.values.stockCostBasis).toStrictEqual(
            [
              /* Feb-17 */ 1117.87 * 80.510256 + 1499.7 * 133.36,
              /* Mar-17 */ 1117.87 * 80.510256 + 1499.7 * 133.36 + 450 * 100,
              /* Apr-17 */ 1117.87 * 80.510256 -
                1117.87 * 72.24453648 +
                (1499.7 * 133.36 - 1499.7 * 177.1167567) +
                (450 * 100 - 450 * 112 + 20 + 80),
              /* May-17 */ costBasisMay17,
              /* Jun-17 */ costBasisMay17,
              /* Jul-17 */ costBasisMay17,
              /* Aug-17 */ costBasisMay17,
              /* Sep-17 */ costBasisMay17,
              /* Oct-17 */ costBasisMay17,
              /* Nov-17 */ costBasisMay17,
              /* Dec-17 */ costBasisMay17,
              /* Jan-18 */ costBasisMay17,
              /* Feb-18 */ costBasisMay17,
              /* Mar-18 */ costBasisMay17,
              /* Apr-18 */ costBasisMay17 + expectedStockPurchaseAverage,
              /* May-18 */ costBasisMay17 + expectedStockPurchaseAverage * 2,
              /* Jun-18 */ costBasisMay17 + expectedStockPurchaseAverage * 3,
              /* Jul-18 */ costBasisMay17 + expectedStockPurchaseAverage * 4,
            ].map(Math.round),
          );
        });
      });
    });

    describe('when there is a net worth entry for the current month', () => {
      // Check the test data at src/client/test-data/state.ts to verify these assertions
      const currentFundsValue = (10 - 1.32) * 4973 + 51 * 113;

      const { annualisedFundReturns } = testState[PageNonStandard.Overview];

      const stocksJan18 = 100779;
      const stocksFeb18 = 101459;
      const stocksMar18 = currentFundsValue;
      const stocksApr18 =
        stocksMar18 * (1 + annualisedFundReturns) ** (1 / 12) + expectedStockPurchaseAverage;
      const stocksMay18 =
        stocksApr18 * (1 + annualisedFundReturns) ** (1 / 12) + expectedStockPurchaseAverage;
      const stocksJun18 =
        stocksMay18 * (1 + annualisedFundReturns) ** (1 / 12) + expectedStockPurchaseAverage;
      const stocksJul18 =
        stocksJun18 * (1 + annualisedFundReturns) ** (1 / 12) + expectedStockPurchaseAverage;

      const stocks = [
        /* Jan-18 */ stocksJan18,
        /* Feb-18 */ stocksFeb18,
        /* Mar-18 */ stocksMar18,
        /* Apr-18 */ stocksApr18,
        /* May-18 */ stocksMay18,
        /* Jun-18 */ stocksJun18,
        /* Jul-18 */ stocksJul18,
      ];

      const pension = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 10654,
        /* Mar-18 */ 11237,
        /* Apr-18 */ 11237,
        /* May-18 */ 11237,
        /* Jun-18 */ 11237,
        /* Jul-18 */ 11237,
      ];

      const cashOther = [
        /* Jan-18 */ 0,
        /* Feb-18 */ 855912 + 657 * 123.6,
        /* Mar-18 */ 165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1,
        /* Apr-18 */ 165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1 + 41 * 1 * 123.6,
        /* May-18 */ 165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1 + 41 * 2 * 123.6,
        /* Jun-18 */ 165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1 + 41 * 3 * 123.6,
        /* Jul-18 */ 165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1 + 41 * 4 * 123.6,
      ];

      const monthlyLoanPayment =
        ((1.0279 ** (1 / 12) - 1) * 18420900) / (1 - (1.0279 ** (1 / 12)) ** -(12 * 25 - 2));

      const illiquidValue = [
        /* Jan-18 */ 21000000,
        /* Feb-18 */ 21000000,
        /* Mar-18 */ 21500000,
        /* Apr-18 */ 21500000 * illiquidAppreciation ** (1 / 12),
        /* May-18 */ 21500000 * illiquidAppreciation ** (2 / 12),
        /* Jun-18 */ 21500000 * illiquidAppreciation ** (3 / 12),
        /* Jul-18 */ 21500000 * illiquidAppreciation ** (4 / 12),
      ];

      const loanDebt = [
        /* Jan-18 */ -19319500,
        /* Feb-18 */ -18744200,
        /* Mar-18 */ -18420900,
        /* Apr-18 */ -(18420900 * 1.0279 ** (1 / 12) - monthlyLoanPayment),
        /* May-18 */ -(
          (18420900 * 1.0279 ** (1 / 12) - monthlyLoanPayment) * 1.0279 ** (1 / 12) -
          monthlyLoanPayment
        ),
        /* Jun-18 */ -(
          ((18420900 * 1.0279 ** (1 / 12) - monthlyLoanPayment) * 1.0279 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0279 ** (1 / 12) -
          monthlyLoanPayment
        ),
        /* Jul-18 */ -(
          (((18420900 * 1.0279 ** (1 / 12) - monthlyLoanPayment) * 1.0279 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0279 ** (1 / 12) -
            monthlyLoanPayment) *
            1.0279 ** (1 / 12) -
          monthlyLoanPayment
        ),
      ];

      const illiquidEquity = [
        /* Jan-18 */ illiquidValue[0] + loanDebt[0],
        /* Feb-18 */ illiquidValue[1] + loanDebt[1],
        /* Mar-18 */ illiquidValue[2] + loanDebt[2],
        /* Apr-18 */ illiquidValue[3] + loanDebt[3],
        /* May-18 */ illiquidValue[4] + loanDebt[4],
        /* Jun-18 */ illiquidValue[5] + loanDebt[5],
        /* Jul-18 */ illiquidValue[6] + loanDebt[6],
      ];

      const feb18OptionValue = 657 * (176.28 - 123.6);
      const mar18OptionValue = 698 * (182.3 - 123.6) + 101 * (95.57 - 77.65);
      const apr18OptionValue =
        698 * (182.3 - 123.6) + 101 * (95.57 - 77.65) + 41 * 1 * (182.3 - 123.6);
      const may18OptionValue =
        698 * (182.3 - 123.6) + 101 * (95.57 - 77.65) + 41 * 2 * (182.3 - 123.6);
      const jun18OptionValue =
        698 * (182.3 - 123.6) + 101 * (95.57 - 77.65) + 41 * 3 * (182.3 - 123.6);
      const jul18OptionValue =
        698 * (182.3 - 123.6) + 101 * (95.57 - 77.65) + 41 * 4 * (182.3 - 123.6);

      const options = [
        /* Jan-18 */ 0,
        /* Feb-18 */ feb18OptionValue,
        /* Mar-18 */ mar18OptionValue,
        /* Apr-18 */ apr18OptionValue,
        /* May-18 */ may18OptionValue,
        /* Jun-18 */ jun18OptionValue,
        /* Jul-18 */ jul18OptionValue,
      ];

      const income = [
        2000,
        1900,
        1500,
        expectedIncomeAverage,
        expectedIncomeAverage,
        expectedIncomeAverage,
        expectedIncomeAverage,
      ];
      const bills = [1000, 900, 400, 650, 0, 0, 0];
      const food = [50, 13, 20, 20, 20, 20, 20];
      const general = [150, 90, 10, 90, 90, 90, 90];
      const social = [50, 65, 134, 65, 65, 65, 65];
      const holiday = [10, 1000, 95, 95, 95, 95, 95];

      const spending = [
        /* Jan-18 */ 1000 + 50 + 150 + 50 + 10,
        /* Feb-18 */ 900 + 13 + 90 + 65 + 1000,
        /* Mar-18 */ 400 + 20 + 10 + 134 + 95,
        /* Apr-18 */ 270 + /* bills */ 650,
        /* May-18 */ 270,
        /* Jun-18 */ 270,
        /* Jul-18 */ 270,
      ];

      // We're currently in March, at the end of the month, so we
      // start predicting from April onwards
      const assetsPredictedApr18 =
        assetsActual[2] +
        income[3] -
        spending[3] +
        stocks[3] -
        stocks[2] -
        expectedStockPurchaseAverage +
        illiquidValue[3] -
        illiquidValue[2] +
        cashOther[3] -
        cashOther[2];
      const assetsPredictedMay18 =
        assetsPredictedApr18 +
        income[4] -
        spending[4] +
        stocks[4] -
        stocks[3] -
        expectedStockPurchaseAverage +
        illiquidValue[4] -
        illiquidValue[3] +
        cashOther[4] -
        cashOther[3];
      const assetsPredictedJun18 =
        assetsPredictedMay18 +
        income[5] -
        spending[5] +
        stocks[5] -
        stocks[4] -
        expectedStockPurchaseAverage +
        illiquidValue[5] -
        illiquidValue[4] +
        cashOther[5] -
        cashOther[4];
      const assetsPredictedJul18 =
        assetsPredictedJun18 +
        income[6] -
        spending[6] +
        stocks[6] -
        stocks[5] -
        expectedStockPurchaseAverage +
        illiquidValue[6] -
        illiquidValue[5] +
        cashOther[6] -
        cashOther[5];

      const liabilitiesPredictedApr18 = liabilitiesActual[2] + loanDebt[3] - loanDebt[2];
      const liabilitiesPredictedMay18 = liabilitiesPredictedApr18 + loanDebt[4] - loanDebt[3];
      const liabilitiesPredictedJun18 = liabilitiesPredictedMay18 + loanDebt[5] - loanDebt[4];
      const liabilitiesPredictedJul18 = liabilitiesPredictedJun18 + loanDebt[6] - loanDebt[5];

      const assets = [
        /* Jan-18 */ assetsActual[0],
        /* Feb-18 */ assetsActual[1],
        /* Mar-18 */ assetsActual[2],
        /* Apr-18 */ assetsPredictedApr18,
        /* May-18 */ assetsPredictedMay18,
        /* Jun-18 */ assetsPredictedJun18,
        /* Jul-18 */ assetsPredictedJul18,
      ];

      const liabilities = [
        /* Jan-18 */ liabilitiesActual[0],
        /* Feb-18 */ liabilitiesActual[1],
        /* Mar-18 */ liabilitiesActual[2],
        /* Apr-18 */ liabilitiesPredictedApr18,
        /* May-18 */ liabilitiesPredictedMay18,
        /* Jun-18 */ liabilitiesPredictedJun18,
        /* Jul-18 */ liabilitiesPredictedJul18,
      ];

      const netWorth = [
        /* Jan-18 */ assets[0] + liabilities[0],
        /* Feb-18 */ assets[1] + liabilities[1],
        /* Mar-18 */ assets[2] + liabilities[2],
        /* Apr-18 */ assets[3] + liabilities[3],
        /* May-18 */ assets[4] + liabilities[4],
        /* Jun-18 */ assets[5] + liabilities[5],
        /* Jul-18 */ assets[6] + liabilities[6],
      ];

      it.each`
        description                        | prop                | value
        ${'assets'}                        | ${'assets'}         | ${assets}
        ${'liabilities'}                   | ${'liabilities'}    | ${liabilities}
        ${'net worth (excluding options)'} | ${'netWorth'}       | ${netWorth}
        ${'stocks'}                        | ${'stocks'}         | ${stocks}
        ${'pension'}                       | ${'pension'}        | ${pension}
        ${'other cash'}                    | ${'cashOther'}      | ${cashOther}
        ${'illiquid equity'}               | ${'illiquidEquity'} | ${illiquidEquity}
        ${'options'}                       | ${'options'}        | ${options}
        ${'income'}                        | ${'income'}         | ${income}
        ${'bills'}                         | ${'bills'}          | ${bills}
        ${'food'}                          | ${'food'}           | ${food}
        ${'general'}                       | ${'general'}        | ${general}
        ${'social'}                        | ${'social'}         | ${social}
        ${'holiday'}                       | ${'holiday'}        | ${holiday}
        ${'spending'}                      | ${'spending'}       | ${spending}
      `('should use the actual $description value for the current month', ({ prop, value }) => {
        expect.assertions(1);
        const { values: result } = getOverviewGraphValues(endOfMonth(now), 0)(testState);
        expect(result[prop as keyof OverviewGraphValues]).toStrictEqual(value.map(Math.round));
      });

      it('should return the start prediction index', () => {
        expect.assertions(1);
        expect(getOverviewGraphValues(now, 0)(testState).startPredictionIndex).toBe(3);
      });
    });

    describe('when there are updated fund prices', () => {
      const testStateWithFundPrices: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: 193,
              item: 'My stock',
              transactions: [
                {
                  date: new Date('2018-01-03'),
                  units: 101,
                  price: 56.23,
                  fees: 10,
                  taxes: 11,
                  drip: false,
                },
              ],
              stockSplits: [],
            },
          ],
          todayPrices: {
            193: 67.93,
          },
        },
      };

      it('should recalculate the current month fund value', () => {
        expect.assertions(1);
        const { values: result } = getOverviewGraphValues(now, 0)(testStateWithFundPrices);
        expect(result.stocks[2]).toBe(Math.round(101 * 67.93));
      });
    });

    describe('when making long term predictions', () => {
      const testLongTermOptions: LongTermOptions = {
        enabled: true,
        rates: {
          income: 350000,
          stockPurchase: 185000,
        },
      };

      describe.each`
        case                                                      | stateToTest
        ${'there is a net worth entry for the current month'}     | ${testState}
        ${'there is not a net worth entry for the current month'} | ${stateWithoutCurrentMonth}
      `('when $case', ({ stateToTest }) => {
        it('should predict 30 years into the future, yearly', () => {
          expect.assertions(1);
          const result = getOverviewGraphValues(now, 0, testLongTermOptions)(stateToTest);
          expect(result.dates).toStrictEqual([
            new Date('2018-01-31T23:59:59.999Z'),
            new Date('2018-02-28T23:59:59.999Z'),
            new Date('2018-03-31T23:59:59.999Z'),
            new Date('2019-03-31T23:59:59.999Z'),
            new Date('2020-03-31T23:59:59.999Z'),
            new Date('2021-03-31T23:59:59.999Z'),
            new Date('2022-03-31T23:59:59.999Z'),
            new Date('2023-03-31T23:59:59.999Z'),
            new Date('2024-03-31T23:59:59.999Z'),
            new Date('2025-03-31T23:59:59.999Z'),
            new Date('2026-03-31T23:59:59.999Z'),
            new Date('2027-03-31T23:59:59.999Z'),
            new Date('2028-03-31T23:59:59.999Z'),
            new Date('2029-03-31T23:59:59.999Z'),
            new Date('2030-03-31T23:59:59.999Z'),
            new Date('2031-03-31T23:59:59.999Z'),
            new Date('2032-03-31T23:59:59.999Z'),
            new Date('2033-03-31T23:59:59.999Z'),
            new Date('2034-03-31T23:59:59.999Z'),
            new Date('2035-03-31T23:59:59.999Z'),
            new Date('2036-03-31T23:59:59.999Z'),
            new Date('2037-03-31T23:59:59.999Z'),
            new Date('2038-03-31T23:59:59.999Z'),
            new Date('2039-03-31T23:59:59.999Z'),
            new Date('2040-03-31T23:59:59.999Z'),
            new Date('2041-03-31T23:59:59.999Z'),
            new Date('2042-03-31T23:59:59.999Z'),
            new Date('2043-03-31T23:59:59.999Z'),
            new Date('2044-03-31T23:59:59.999Z'),
            new Date('2045-03-31T23:59:59.999Z'),
            new Date('2046-03-31T23:59:59.999Z'),
            new Date('2047-03-31T23:59:59.999Z'),
            new Date('2048-03-31T23:59:59.999Z'),
          ]);
        });
      });

      it('should extrapolate the (yearly) income values explicitly', () => {
        expect.assertions(3);
        const { values: result } = getOverviewGraphValues(now, 0, testLongTermOptions)(testState);

        expect(result.income).toHaveLength(33);
        expect(result.income.slice(0, 3)).toStrictEqual([2000, 1900, 1500]);

        expect(result.income.slice(3).every((value) => value === 350000 * 12)).toBe(true);
      });

      it('should extrapolate the (yearly) spending values explicitly', () => {
        expect.assertions(2);
        const result = getOverviewGraphValues(now, 0, testLongTermOptions)(testState);

        expect(result.values.spending).toHaveLength(33);
        expect(result.values.spending).toMatchInlineSnapshot(`
          Array [
            1260,
            2068,
            713,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
            14124,
          ]
        `);
      });

      it('should extend the stock values based on assumed investment', () => {
        expect.assertions(1);
        const { annualisedFundReturns } = testState[PageNonStandard.Overview];
        const { values: result } = getOverviewGraphValues(now, 0, testLongTermOptions)(testState);
        const { values: resultWithoutFuture } = getOverviewGraphValues(now, 0)(testState);

        const returnRate = (1 + annualisedFundReturns) ** (1 / 12);

        const stocksMar18 = resultWithoutFuture.stocks[2];
        const stocksMar19 =
          (((((((((((stocksMar18 * /* Apr */ returnRate + 185000) /* May */ * returnRate +
            185000) /* Jun */ *
            returnRate +
            185000) /* Jul */ *
            returnRate +
            185000) /* Aug */ *
            returnRate +
            185000) /* Sep */ *
            returnRate +
            185000) /* Oct */ *
            returnRate +
            185000) /* Nov */ *
            returnRate +
            185000) /* Dec */ *
            returnRate +
            185000) /* Jan */ *
            returnRate +
            185000) /* Feb */ *
            returnRate +
            185000) /* Mar */ *
            returnRate +
          185000;
        const stocksMar20 =
          (((((((((((stocksMar19 * /* Apr */ returnRate + 185000) /* May */ * returnRate +
            185000) /* Jun */ *
            returnRate +
            185000) /* Jul */ *
            returnRate +
            185000) /* Aug */ *
            returnRate +
            185000) /* Sep */ *
            returnRate +
            185000) /* Oct */ *
            returnRate +
            185000) /* Nov */ *
            returnRate +
            185000) /* Dec */ *
            returnRate +
            185000) /* Jan */ *
            returnRate +
            185000) /* Feb */ *
            returnRate +
            185000) /* Mar */ *
            returnRate +
          185000;
        const stocksMar21 =
          (((((((((((stocksMar20 * /* Apr */ returnRate + 185000) /* May */ * returnRate +
            185000) /* Jun */ *
            returnRate +
            185000) /* Jul */ *
            returnRate +
            185000) /* Aug */ *
            returnRate +
            185000) /* Sep */ *
            returnRate +
            185000) /* Oct */ *
            returnRate +
            185000) /* Nov */ *
            returnRate +
            185000) /* Dec */ *
            returnRate +
            185000) /* Jan */ *
            returnRate +
            185000) /* Feb */ *
            returnRate +
            185000) /* Mar */ *
            returnRate +
          185000;

        expect(result.stocks.slice(2, 6)).toStrictEqual(
          [stocksMar18, stocksMar19, stocksMar20, stocksMar21].map(Math.round),
        );
      });

      it('should predict the loan debt down to zero', () => {
        expect.assertions(2);
        const { values: result } = getOverviewGraphValues(now, 0, testLongTermOptions)(testState);

        // Assert essentially that there is no debt by the end
        expect(result.illiquidEquity[result.illiquidEquity.length - 1]).toBe(
          Math.round(
            result.illiquidEquity[result.illiquidEquity.length - 2] * illiquidAppreciation,
          ),
        );

        expect(result.illiquidEquity).toMatchInlineSnapshot(`
          Array [
            1680500,
            2255800,
            3079100,
            4678252,
            6345778,
            8084773,
            9898479,
            11790290,
            13763760,
            15822610,
            17970740,
            20212232,
            22551362,
            24992609,
            27540666,
            30200447,
            32977101,
            35876022,
            38902861,
            42063539,
            45364259,
            48811523,
            52412140,
            56173248,
            60102327,
            64207215,
            68496126,
            72806631,
            76446963,
            80269311,
            84282776,
            88496915,
            92921761,
          ]
        `);
      });

      it('should predict the bills numbers', () => {
        expect.assertions(2);
        const { values: result } = getOverviewGraphValues(now, 0, testLongTermOptions)(testState);

        expect(result.bills[10]).not.toBe(0);
        expect(result.bills).toMatchInlineSnapshot(`
          Array [
            1000,
            900,
            400,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
            10800,
          ]
        `);
      });
    });
  });

  describe('getOverviewTable', () => {
    it('should get a list of rows for the overview table', () => {
      expect.assertions(1);
      const table = getOverviewTable(now)(state);

      expect(table).toMatchInlineSnapshot(`
        Array [
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#b71c1c",
                "value": 1000,
              },
              "food": Object {
                "rgb": "#43a047",
                "value": 50,
              },
              "general": Object {
                "rgb": "#01579b",
                "value": 150,
              },
              "holiday": Object {
                "rgb": "#fff",
                "value": 10,
              },
              "income": Object {
                "rgb": "#24bf37",
                "value": 2000,
              },
              "net": Object {
                "rgb": "#b5e9bc",
                "value": 740,
              },
              "netWorth": Object {
                "rgb": "#fff",
                "value": 1680500,
              },
              "social": Object {
                "rgb": "#fff",
                "value": 50,
              },
              "spending": Object {
                "rgb": "#d26565",
                "value": 1260,
              },
              "stocks": Object {
                "rgb": "#fff",
                "value": 100779,
              },
            },
            "future": false,
            "month": 1,
            "monthText": "Jan-18",
            "past": true,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#bd2f2f",
                "value": 900,
              },
              "food": Object {
                "rgb": "#fff",
                "value": 13,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#00897b",
                "value": 1000,
              },
              "income": Object {
                "rgb": "#47c957",
                "value": 1900,
              },
              "net": Object {
                "rgb": "#NaNNaNNaN",
                "value": -168,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4501798,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#bf2424",
                "value": 2068,
              },
              "stocks": Object {
                "rgb": "#fff",
                "value": 101459,
              },
            },
            "future": false,
            "month": 2,
            "monthText": "Feb-18",
            "past": true,
            "year": 2018,
          },
          Object {
            "active": true,
            "cells": Object {
              "bills": Object {
                "rgb": "#db8e8e",
                "value": 400,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "general": Object {
                "rgb": "#fff",
                "value": 10,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#fff",
                "value": 1500,
              },
              "net": Object {
                "rgb": "#b1e8b7",
                "value": 787,
              },
              "netWorth": Object {
                "rgb": "#38c549",
                "value": 4248848,
              },
              "social": Object {
                "rgb": "#bf9e24",
                "value": 181,
              },
              "spending": Object {
                "rgb": "#df9292",
                "value": 713,
              },
              "stocks": Object {
                "rgb": "#adb9bf",
                "value": 399098,
              },
            },
            "future": false,
            "month": 3,
            "monthText": "Mar-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#cc5e5e",
                "value": 650,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#92df9b",
                "value": 1686,
              },
              "net": Object {
                "rgb": "#b3e9ba",
                "value": 759,
              },
              "netWorth": Object {
                "rgb": "#2dc23f",
                "value": 4389869,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#da8080",
                "value": 927,
              },
              "stocks": Object {
                "rgb": "#aab7bd",
                "value": 410252,
              },
            },
            "future": true,
            "month": 4,
            "monthText": "Apr-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#92df9b",
                "value": 1686,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 1409,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4532120,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
              "stocks": Object {
                "rgb": "#8d9fa7",
                "value": 421530,
              },
            },
            "future": true,
            "month": 5,
            "monthText": "May-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#92df9b",
                "value": 1686,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 1409,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4674956,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
              "stocks": Object {
                "rgb": "#718690",
                "value": 432934,
              },
            },
            "future": true,
            "month": 6,
            "monthText": "Jun-18",
            "past": false,
            "year": 2018,
          },
          Object {
            "active": false,
            "cells": Object {
              "bills": Object {
                "rgb": "#fff",
                "value": 0,
              },
              "food": Object {
                "rgb": "#a1d0a3",
                "value": 27,
              },
              "general": Object {
                "rgb": "#80abcd",
                "value": 90,
              },
              "holiday": Object {
                "rgb": "#80c4bd",
                "value": 95,
              },
              "income": Object {
                "rgb": "#92df9b",
                "value": 1686,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 1409,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4818378,
              },
              "social": Object {
                "rgb": "#dfcf92",
                "value": 65,
              },
              "spending": Object {
                "rgb": "#fff",
                "value": 277,
              },
              "stocks": Object {
                "rgb": "#546e7a",
                "value": 444467,
              },
            },
            "future": true,
            "month": 7,
            "monthText": "Jul-18",
            "past": false,
            "year": 2018,
          },
        ]
      `);
    });
  });

  describe('getLongTermRates', () => {
    /*
     * Calculated by (exponential average):
     * (1500 / 2 + 1900 / 4 + 2000 / 8) /
     * (1 / 2 + 1 / 4 + 1 / 8)
     */
    const expectedIncome = 1685.714;

    /*
     * Calculated by (simple mean):
     * (20050 + 0 + 0) / 3
     */
    const expectedStockPurchase = 6683.333;

    it.each`
      thing              | value
      ${'income'}        | ${expectedIncome}
      ${'stockPurchase'} | ${expectedStockPurchase}
    `('should return the calculated average for $thing', ({ thing, value }) => {
      expect.assertions(1);
      const result = getLongTermRates(now)(state);
      expect(result[thing as keyof LongTermOptions['rates']]).toBeCloseTo(value);
    });
  });
});
