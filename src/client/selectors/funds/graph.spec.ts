import { getUnixTime } from 'date-fns';
import numericHash from 'string-hash';

import { getFundItems, getFundLines } from './graph';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { abbreviateFundName } from '~client/modules/finance';
import { State } from '~client/reducers';
import { colors } from '~client/styled/variables';
import { testState } from '~client/test-data';
import type { Data, FundItem } from '~client/types';
import { FundMode, FundPeriod, PageNonStandard } from '~client/types/enum';

describe('Fund selectors / graph', () => {
  const today = new Date('2020-04-20');
  const state: State = {
    ...testState,
    api: {
      ...testState.api,
      appConfig: {
        ...testState.api.appConfig,
        historyOptions: { period: FundPeriod.Year, length: 1 },
      },
    },
    funds: {
      ...testState.funds,
      viewSoldFunds: true,
    },
  };

  describe('getFundItems', () => {
    it('should get an ordered (by value) list of available funds with an overall item', () => {
      expect.assertions(1);
      expect(getFundItems.today(today)(state)).toStrictEqual<FundItem[]>([
        {
          id: GRAPH_FUNDS_OVERALL_ID,
          item: 'Overall',
          color: colors.black,
          orders: [
            {
              time: getUnixTime(new Date('2016-09-21')),
              isSell: false,
              isReinvestment: false,
              size: 1499.7 * 133.36,
            },
            {
              time: getUnixTime(new Date('2017-01-11')),
              isSell: false,
              isReinvestment: false,
              size: 1117.87 * 80.510256,
            },
            {
              time: getUnixTime(new Date('2017-03-03')),
              isSell: false,
              isReinvestment: false,
              size: 450 * 100,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 450 * 112,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 1117.87 * 72.24453648,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 1499.7 * 177.1167567,
            },
            {
              time: getUnixTime(new Date('2017-05-09')),
              isSell: false,
              isReinvestment: false,
              size: 428 * 934,
            },
          ],
        },
        {
          id: 10,
          item: 'some fund 1',
          color: colorKey(abbreviateFundName('some fund 1')),
          orders: [
            {
              time: getUnixTime(new Date('2017-05-09')),
              isSell: false,
              isReinvestment: false,
              size: 428 * 934,
            },
          ],
        },
        {
          id: 3,
          item: 'some fund 2',
          color: colorKey(abbreviateFundName('some fund 2')),
          orders: [
            {
              time: getUnixTime(new Date('2017-03-03')),
              isSell: false,
              isReinvestment: false,
              size: 450 * 100,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 450 * 112,
            },
          ],
        },
        {
          id: 1,
          item: 'some fund 3',
          color: colorKey(abbreviateFundName('some fund 3')),
          orders: [
            {
              time: getUnixTime(new Date('2017-01-11')),
              isSell: false,
              isReinvestment: false,
              size: 1117.87 * 80.510256,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 1117.87 * 72.24453648,
            },
          ],
        },
        {
          id: 5,
          item: 'test fund 4',
          color: colorKey(abbreviateFundName('test fund 4')),
          orders: [
            {
              time: getUnixTime(new Date('2016-09-21')),
              isSell: false,
              isReinvestment: false,
              size: 1499.7 * 133.36,
            },
            {
              time: getUnixTime(new Date('2017-04-27')),
              isSell: true,
              isReinvestment: false,
              size: 1499.7 * 177.1167567,
            },
          ],
        },
      ]);
    });

    it('should filter out sold funds, if the options is set', () => {
      expect.assertions(1);
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      expect(getFundItems.today(today)(stateNoSold)).toStrictEqual<Partial<FundItem>[]>([
        expect.objectContaining({
          id: GRAPH_FUNDS_OVERALL_ID,
          item: 'Overall',
          color: colors.black,
        }),
        expect.objectContaining({
          id: 10,
          item: 'some fund 1',
          color: colorKey(abbreviateFundName('some fund 1')),
        }),
      ]);
    });

    it('should filter out funds with only future transactions', () => {
      expect.assertions(1);

      const stateWithFutureFund = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              ...state[PageNonStandard.Funds].items[0],
              item: 'Some future fund',
              transactions: [
                { date: new Date('2020-04-21'), units: 23, price: 4.47826, fees: 0, taxes: 0 },
              ],
            },
            ...state[PageNonStandard.Funds].items.slice(1),
          ],
        },
      };

      expect(getFundItems.today(today)(stateWithFutureFund)).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ item: 'Some future fund' })]),
      );
    });
  });

  describe('getFundLines', () => {
    it('should get a list (by mode) of graphed, split fund lines', () => {
      expect.assertions(1);
      const result = getFundLines.today(today)(state);
      expect(result).toStrictEqual({
        [FundMode.Roi]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [FundMode.Value]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [FundMode.Stacked]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [FundMode.Price]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
        [FundMode.PriceNormalised]: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            color: expect.stringMatching(/^#[0-9a-f]{6}$/),
            data: expect.arrayContaining([[expect.any(Number), expect.any(Number)]]),
          }),
        ]),
      });
    });

    describe('when stocks are split', () => {
      const stateWithStockSplit: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: 10,
              item: 'some fund 1',
              transactions: [
                {
                  price: 428 * 2 * 5,
                  units: 934 / (2 * 5),
                  fees: 148,
                  taxes: 100,
                  date: new Date('2017-05-09'),
                },
              ],
              stockSplits: [
                {
                  date: new Date('2017-07-04'),
                  ratio: 5,
                },
                {
                  date: new Date('2017-07-19'),
                  ratio: 2,
                },
              ],
            },
          ],
          prices: {
            10: [
              {
                values: [
                  429.5 * 2 * 5,
                  429.5 * 2 * 5,
                  432.3 * 2 * 5,
                  434.9 * 2 * 5,
                  435.7 * 2 * 5,
                  437.9 * 2 * 5,
                  439.6 * 2 * 5,
                  436.0 * 2 * 5,
                  434.9 * 2 * 5,
                  432.8 * 2 * 5,
                  438.4 * 2 * 5,
                  435.5 * 2 * 5,
                  434.9 * 2 * 5,
                  427.9 * 2 * 5,
                  426.3 * 2, // 2017-07-04
                  424.3 * 2,
                  423.1 * 2,
                  427.0 * 2,
                  427.9, // 2017-07-19
                  430.8,
                  431.6,
                  425.9,
                  425.4,
                  432.8,
                  426.7,
                  424.2,
                  428.1,
                  426.5,
                  426.1,
                  424.1,
                  427.3,
                ],
                startIndex: 69,
              },
            ],
          },
        },
      };

      it('should rebase the prices for the split stock', () => {
        expect.assertions(1);

        const fundLines = getFundLines.today(today)(stateWithStockSplit);

        const splitLinePrice = fundLines[FundMode.Price].find((line) => line.id === 10);

        expect(splitLinePrice?.data).toStrictEqual([
          [18860400, 429.5],
          [19033200, 429.5],
          [19378800, 432.3],
          [19810801, 434.9],
          [19983601, 435.7],
          [20415601, 437.9],
          [20674800, 439.6],
          [21020401, 436.0],
          [21625201, 434.9],
          [21884401, 432.8],
          [22230000, 438.4],
          [22489200, 435.5],
          [22921201, 434.9],
          [23094000, 427.9],
          [23526000, 426.3], // 2017-07-04
          [23785201, 424.3],
          [24130800, 423.1],
          [24390000, 427.0],
          [24822000, 427.9], // 2017-07-19
          [24994800, 430.8],
          [25426800, 431.6],
          [25858801, 425.9],
          [26031600, 425.4],
          [26463600, 432.8],
          [26722800, 426.7],
          [27068400, 424.2],
          [27327601, 428.1],
          [27759601, 426.5],
          [27932400, 426.1],
          [28364400, 424.1],
          [28623600, 427.3],
        ]);
      });

      it('should use rebased prices to calculate ROI', () => {
        expect.assertions(1);

        const fundLines = getFundLines.today(today)(stateWithStockSplit);

        const splitLineROI = fundLines[FundMode.Roi].find((line) => line.id === 10);

        expect(splitLineROI?.data).toStrictEqual([
          [18860400, 0.29],
          [19033200, 0.29],
          [19378800, 0.94],
          [19810801, 1.55],
          [19983601, 1.74],
          [20415601, 2.25],
          [20674800, 2.65],
          [21020401, 1.81],
          [21625201, 1.55],
          [21884401, 1.06],
          [22230000, 2.37],
          [22489200, 1.69],
          [22921201, 1.55],
          [23094000, -0.09],
          [23526000, -0.46], // 2017-07-04
          [23785201, -0.93],
          [24130800, -1.21],
          [24390000, -0.3],
          [24822000, -0.09], // 2017-07-19
          [24994800, 0.59],
          [25426800, 0.78],
          [25858801, -0.55],
          [26031600, -0.67],
          [26463600, 1.06],
          [26722800, -0.37],
          [27068400, -0.95],
          [27327601, -0.04],
          [27759601, -0.41],
          [27932400, -0.51],
          [28364400, -0.97],
          [28623600, -0.23],
        ]);
      });
    });

    it('should filter out sold funds, if the option is set', () => {
      expect.assertions(9);
      const stateNoSold = {
        ...state,
        funds: {
          ...state.funds,
          viewSoldFunds: false,
        },
      };

      const soldIds = [3, 1, 5];

      const result = getFundLines.today(today)(stateNoSold);

      soldIds.forEach((soldId) => {
        expect(result[FundMode.Roi]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );

        expect(result[FundMode.Value]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );

        expect(result[FundMode.Price]).not.toStrictEqual(
          expect.objectContaining({
            [soldId]: expect.anything,
          }),
        );
      });
    });

    it('should include all past transactions of a sold fund on the last datapoint', () => {
      expect.assertions(1);
      const stateWithSold = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              ...state[PageNonStandard.Funds].items[0],
              transactions: [
                { date: new Date('2017-05-09'), units: 934, price: 428.2655, fees: 0, taxes: 0 },
                { date: new Date('2017-07-10'), units: -934, price: 522.229, fees: 0, taxes: 0 },
                { date: new Date('2020-04-21'), units: 1000, price: 79.015, fees: 0, taxes: 0 },
              ],
            },
            ...state[PageNonStandard.Funds].items.slice(1),
          ],
        },
      };

      const result = getFundLines.today(today)(stateWithSold);

      const overallLine = result[FundMode.Roi].find(({ id }) => id === GRAPH_FUNDS_OVERALL_ID);

      expect(overallLine?.data[overallLine?.data.length - 1]).toMatchInlineSnapshot(`
        Array [
          28623600,
          20.33,
        ]
      `);
    });

    describe('when some funds are not included in the data set', () => {
      // This was causing a bug where the reported ROI on the graph was
      // inconsistent depending on the period / length requested, and
      // not equal to the value on the main header
      const stateWithExcludedFund: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('included-fund'),
              item: 'Included fund',
              transactions: [
                {
                  date: new Date('2016-10-05'),
                  units: 950,
                  price: 55.12,
                  fees: 22,
                  taxes: 32,
                },
              ],
              stockSplits: [],
            },
            {
              id: numericHash('excluded-fund'),
              item: 'Excluded fund',
              transactions: [
                {
                  date: new Date('2014-02-05'),
                  units: 105,
                  price: 86.92,
                  fees: 54,
                  taxes: 30,
                },
                {
                  date: new Date('2014-03-10'),
                  units: -105,
                  price: 88.56,
                  fees: 105,
                  taxes: 26,
                },
              ],
              stockSplits: [],
            },
          ],
          __optimistic: [undefined, undefined],
          startTime: getUnixTime(new Date('2020-01-02')),
          cacheTimes: [86400 * 10, 86400 * 13],
          prices: {
            [numericHash('included-fund')]: [
              {
                startIndex: 0,
                values: [54.78, 59.83],
              },
            ],
          },
        },
      };

      it('should include the excluded funds realised values', () => {
        expect.assertions(1);
        const overallLine = getFundLines
          .today(today)(stateWithExcludedFund)
          [FundMode.Roi].find(({ id }) => id === GRAPH_FUNDS_OVERALL_ID)?.data as Data;

        const expectedRealisedValue = 105 * 88.56 - (105 + 26);
        const expectedPaperValue = 950 * 59.83;
        const expectedCosts = 950 * 55.12 + 22 + 32 + 105 * 86.92 + 54 + 30;

        const expectedGain =
          (100 * (expectedPaperValue + expectedRealisedValue - expectedCosts)) / expectedCosts;

        expect(overallLine[overallLine.length - 1][1]).toBeCloseTo(expectedGain);
      });
    });
  });
});
