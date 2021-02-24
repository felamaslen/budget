import numericHash from 'string-hash';
import { getProcessedMonthlyValues, getOverviewTable } from '.';
import type { State } from '~client/reducers/types';
import { testState as state } from '~client/test-data';
import { mockRandom } from '~client/test-utils/random';
import type { MonthlyProcessed } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

describe('Overview selectors', () => {
  beforeEach(() => {
    mockRandom([0.15, 0.99]);
  });

  const now = new Date('2018-03-23T11:54:23.127Z');

  describe('getProcessedMonthlyValues', () => {
    const testState: State = {
      ...state,
      [PageNonStandard.Funds]: {
        ...state[PageNonStandard.Funds],
        items: [
          {
            id: numericHash('fund-A'),
            item: 'some fund 1',
            transactions: [
              { date: new Date('2018-02-05'), units: 10, price: 5612, fees: 3, taxes: 0 },
              { date: new Date('2018-03-27'), units: -1.32, price: 1804, fees: 0.72, taxes: 0 },
            ],
            allocationTarget: 0,
          },
          {
            id: numericHash('fund-B'),
            item: 'some fund 2',
            transactions: [
              { date: new Date('2018-03-17'), units: 51, price: 109, fees: 3, taxes: 0 },
            ],
            allocationTarget: 0,
          },
        ],
        prices: {
          [numericHash('fund-A')]: [{ startIndex: 0, values: [4973] }],
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

    describe('when the current day is not the last day of the month', () => {
      const dateInMiddleOfMonth = new Date('2018-03-23T10:03:20Z');

      // Check the test data at src/client/test-data/state.ts to verify these assertions
      const currentFundsValue = 10 * 4973 + 51 * 113;
      const stocks = [
        /* Jan-18 */ 100779,
        /* Feb-18 */ 101459,
        /* Mar-18 */ currentFundsValue,
        /* Apr-18 */ 104281,
        /* May-18 */ 105597,
        /* Jun-18 */ 106930,
        /* Jul-18 */ 108280,
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

      const monthlyMortgagePayment =
        ((1.0274 ** (1 / 12) - 1) * 18744200) / (1 - (1.0274 ** (1 / 12)) ** -359);

      const homeValue = [
        /* Jan-18 */ 21000000,
        /* Feb-18 */ 21000000,
        /* Mar-18 */ 21000000 * 1.05 ** (1 / 12),
        /* Apr-18 */ 21000000 * 1.05 ** (2 / 12),
        /* May-18 */ 21000000 * 1.05 ** (3 / 12),
        /* Jun-18 */ 21000000 * 1.05 ** (4 / 12),
        /* Jul-18 */ 21000000 * 1.05 ** (5 / 12),
      ];

      const homeDebt = [
        /* Jan-18 */ -19319500,
        /* Feb-18 */ -18744200,
        /* Mar-18 */ -(18744200 * 1.0274 ** (1 / 12) - monthlyMortgagePayment),
        /* Apr-18 */ -(
          (18744200 * 1.0274 ** (1 / 12) - monthlyMortgagePayment) * 1.0274 ** (1 / 12) -
          monthlyMortgagePayment
        ),
        /* May-18 */ -(
          ((18744200 * 1.0274 ** (1 / 12) - monthlyMortgagePayment) * 1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
          monthlyMortgagePayment
        ),
        /* Jun-18 */ -(
          (((18744200 * 1.0274 ** (1 / 12) - monthlyMortgagePayment) * 1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
          monthlyMortgagePayment
        ),
        /* Jul-18 */ -(
          ((((18744200 * 1.0274 ** (1 / 12) - monthlyMortgagePayment) * 1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0274 ** (1 / 12) -
          monthlyMortgagePayment
        ),
      ];

      const homeEquity = [
        /* Jan-18 */ homeValue[0] + homeDebt[0],
        /* Feb-18 */ homeValue[1] + homeDebt[1],
        /* Mar-18 */ homeValue[2] + homeDebt[2],
        /* Apr-18 */ homeValue[3] + homeDebt[3],
        /* May-18 */ homeValue[4] + homeDebt[4],
        /* Jun-18 */ homeValue[5] + homeDebt[5],
        /* Jul-18 */ homeValue[6] + homeDebt[6],
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

      const income = [2000, 1900, 1500, 2500, 2300, 1800, 2600];
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
        /* fund-A Mar-27 transaction */ (1804 * 1.32 - 0.72) -
        /* fund-B Mar-17 transaction */ (109 * 51 + 3) +
        homeValue[2] -
        homeValue[1] +
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
        homeValue[3] -
        homeValue[2] +
        cashOther[3] -
        cashOther[2];
      const assetsPredictedMay18 =
        assetsPredictedApr18 +
        income[4] -
        spending[4] +
        stocks[4] -
        stocks[3] +
        homeValue[4] -
        homeValue[3] +
        cashOther[4] -
        cashOther[3];
      const assetsPredictedJun18 =
        assetsPredictedMay18 +
        income[5] -
        spending[5] +
        stocks[5] -
        stocks[4] +
        homeValue[5] -
        homeValue[4] +
        cashOther[5] -
        cashOther[4];
      const assetsPredictedJul18 =
        assetsPredictedJun18 +
        income[6] -
        spending[6] +
        stocks[6] -
        stocks[5] +
        homeValue[6] -
        homeValue[5] +
        cashOther[6] -
        cashOther[5];

      const liabilitiesPredictedMar18 = liabilitiesActual[1] + homeDebt[2] - homeDebt[1];
      const liabilitiesPredictedApr18 = liabilitiesPredictedMar18 + homeDebt[3] - homeDebt[2];
      const liabilitiesPredictedMay18 = liabilitiesPredictedApr18 + homeDebt[4] - homeDebt[3];
      const liabilitiesPredictedJun18 = liabilitiesPredictedMay18 + homeDebt[5] - homeDebt[4];
      const liabilitiesPredictedJul18 = liabilitiesPredictedJun18 + homeDebt[6] - homeDebt[5];

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
        ${'home equity'}                   | ${'homeEquity'}     | ${homeEquity}
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
        const { values: result } = getProcessedMonthlyValues(dateInMiddleOfMonth, 0)(testState);
        expect(result[prop as keyof MonthlyProcessed]).toStrictEqual(value.map(Math.round));
      });

      it('should return the start prediction index', () => {
        expect.assertions(1);
        expect(
          getProcessedMonthlyValues(dateInMiddleOfMonth, 0)(testState).startPredictionIndex,
        ).toBe(2);
      });

      describe('when showing old months', () => {
        it('should calculate the cost basis for the old months too', () => {
          expect.assertions(1);
          const processedWithOldMonths = getProcessedMonthlyValues(dateInMiddleOfMonth, 11)(state);

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
              /* Apr-18 */ costBasisMay17,
              /* May-18 */ costBasisMay17,
              /* Jun-18 */ costBasisMay17,
              /* Jul-18 */ costBasisMay17,
            ].map(Math.round),
          );
        });
      });
    });

    describe('when the current day is the last of the month', () => {
      const dateAtEndOfMonth = new Date('2018-03-31T11:28:10Z');

      // Check the test data at src/client/test-data/state.ts to verify these assertions
      const currentFundsValue = (10 - 1.32) * 4973 + 51 * 113;
      const stocks = [
        /* Jan-18 */ 100779,
        /* Feb-18 */ 101459,
        /* Mar-18 */ Math.round(currentFundsValue),
        /* Apr-18 */ 104281,
        /* May-18 */ 105597,
        /* Jun-18 */ 106930,
        /* Jul-18 */ 108280,
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

      const monthlyMortgagePayment =
        ((1.0279 ** (1 / 12) - 1) * 18420900) / (1 - (1.0279 ** (1 / 12)) ** -358);

      const homeValue = [
        /* Jan-18 */ 21000000,
        /* Feb-18 */ 21000000,
        /* Mar-18 */ 21500000,
        /* Apr-18 */ 21500000 * 1.05 ** (1 / 12),
        /* May-18 */ 21500000 * 1.05 ** (2 / 12),
        /* Jun-18 */ 21500000 * 1.05 ** (3 / 12),
        /* Jul-18 */ 21500000 * 1.05 ** (4 / 12),
      ];

      const homeDebt = [
        /* Jan-18 */ -19319500,
        /* Feb-18 */ -18744200,
        /* Mar-18 */ -18420900,
        /* Apr-18 */ -(18420900 * 1.0279 ** (1 / 12) - monthlyMortgagePayment),
        /* May-18 */ -(
          (18420900 * 1.0279 ** (1 / 12) - monthlyMortgagePayment) * 1.0279 ** (1 / 12) -
          monthlyMortgagePayment
        ),
        /* Jun-18 */ -(
          ((18420900 * 1.0279 ** (1 / 12) - monthlyMortgagePayment) * 1.0279 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0279 ** (1 / 12) -
          monthlyMortgagePayment
        ),
        /* Jul-18 */ -(
          (((18420900 * 1.0279 ** (1 / 12) - monthlyMortgagePayment) * 1.0279 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0279 ** (1 / 12) -
            monthlyMortgagePayment) *
            1.0279 ** (1 / 12) -
          monthlyMortgagePayment
        ),
      ];

      const homeEquity = [
        /* Jan-18 */ homeValue[0] + homeDebt[0],
        /* Feb-18 */ homeValue[1] + homeDebt[1],
        /* Mar-18 */ homeValue[2] + homeDebt[2],
        /* Apr-18 */ homeValue[3] + homeDebt[3],
        /* May-18 */ homeValue[4] + homeDebt[4],
        /* Jun-18 */ homeValue[5] + homeDebt[5],
        /* Jul-18 */ homeValue[6] + homeDebt[6],
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

      const income = [2000, 1900, 1500, 2500, 2300, 1800, 2600];
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
        stocks[2] +
        homeValue[3] -
        homeValue[2] +
        cashOther[3] -
        cashOther[2];
      const assetsPredictedMay18 =
        assetsPredictedApr18 +
        income[4] -
        spending[4] +
        stocks[4] -
        stocks[3] +
        homeValue[4] -
        homeValue[3] +
        cashOther[4] -
        cashOther[3];
      const assetsPredictedJun18 =
        assetsPredictedMay18 +
        income[5] -
        spending[5] +
        stocks[5] -
        stocks[4] +
        homeValue[5] -
        homeValue[4] +
        cashOther[5] -
        cashOther[4];
      const assetsPredictedJul18 =
        assetsPredictedJun18 +
        income[6] -
        spending[6] +
        stocks[6] -
        stocks[5] +
        homeValue[6] -
        homeValue[5] +
        cashOther[6] -
        cashOther[5];

      const liabilitiesPredictedApr18 = liabilitiesActual[2] + homeDebt[3] - homeDebt[2];
      const liabilitiesPredictedMay18 = liabilitiesPredictedApr18 + homeDebt[4] - homeDebt[3];
      const liabilitiesPredictedJun18 = liabilitiesPredictedMay18 + homeDebt[5] - homeDebt[4];
      const liabilitiesPredictedJul18 = liabilitiesPredictedJun18 + homeDebt[6] - homeDebt[5];

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
        description                        | prop             | value
        ${'assets'}                        | ${'assets'}      | ${assets}
        ${'liabilities'}                   | ${'liabilities'} | ${liabilities}
        ${'net worth (excluding options)'} | ${'netWorth'}    | ${netWorth}
        ${'stocks'}                        | ${'stocks'}      | ${stocks}
        ${'pension'}                       | ${'pension'}     | ${pension}
        ${'other cash'}                    | ${'cashOther'}   | ${cashOther}
        ${'home equity'}                   | ${'homeEquity'}  | ${homeEquity}
        ${'options'}                       | ${'options'}     | ${options}
        ${'income'}                        | ${'income'}      | ${income}
        ${'bills'}                         | ${'bills'}       | ${bills}
        ${'food'}                          | ${'food'}        | ${food}
        ${'general'}                       | ${'general'}     | ${general}
        ${'social'}                        | ${'social'}      | ${social}
        ${'holiday'}                       | ${'holiday'}     | ${holiday}
        ${'spending'}                      | ${'spending'}    | ${spending}
      `('should use the actual $description value for the current month', ({ prop, value }) => {
        expect.assertions(1);
        const { values: result } = getProcessedMonthlyValues(dateAtEndOfMonth, 0)(testState);
        expect(result[prop as keyof MonthlyProcessed]).toStrictEqual(value.map(Math.round));
      });

      it('should return the start prediction index', () => {
        expect.assertions(1);
        expect(getProcessedMonthlyValues(dateAtEndOfMonth, 0)(testState).startPredictionIndex).toBe(
          3,
        );
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
                { date: new Date('2018-01-03'), units: 101, price: 56.23, fees: 10, taxes: 11 },
              ],
            },
          ],
          todayPrices: {
            193: 67.93,
          },
        },
      };

      it('should recalculate the current month fund value', () => {
        expect.assertions(1);
        const { values: result } = getProcessedMonthlyValues(now, 0)(testStateWithFundPrices);
        expect(result.stocks[2]).toBe(Math.round(101 * 67.93));
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
                "rgb": "#92df9b",
                "value": 2000,
              },
              "net": Object {
                "rgb": "#cbf0cf",
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
                "rgb": "#a7e5af",
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
                "rgb": "#f3f5f6",
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
                "rgb": "#c7efcc",
                "value": 787,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4919735,
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
                "rgb": "#546e7a",
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
                "rgb": "#36c448",
                "value": 2500,
              },
              "net": Object {
                "rgb": "#8ede98",
                "value": 1573,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4746426,
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
                "rgb": "#c1cacf",
                "value": 104281,
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
                "rgb": "#5bcf69",
                "value": 2300,
              },
              "net": Object {
                "rgb": "#4ecb5e",
                "value": 2023,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4870127,
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
                "rgb": "#aab7bd",
                "value": 105597,
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
                "rgb": "#bdecc3",
                "value": 1800,
              },
              "net": Object {
                "rgb": "#93e09d",
                "value": 1523,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 4993774,
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
                "rgb": "#a9b6bc",
                "value": 106930,
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
                "rgb": "#24bf37",
                "value": 2600,
              },
              "net": Object {
                "rgb": "#24bf37",
                "value": 2323,
              },
              "netWorth": Object {
                "rgb": "#24bf37",
                "value": 5118667,
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
                "rgb": "#a9b6bc",
                "value": 108280,
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
});
