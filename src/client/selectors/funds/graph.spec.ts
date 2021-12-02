import { endOfDay, getUnixTime } from 'date-fns';
import { round } from 'lodash';
import { replaceAtIndex } from 'replace-array';
import numericHash from 'string-hash';

import { getFundItems, getFundLines } from './graph';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { State } from '~client/reducers';
import { colors } from '~client/styled/variables';
import { testStartTime, testState } from '~client/test-data';
import type { Data, FundItem } from '~client/types';
import { FundMode, FundPeriod, PageNonStandard } from '~client/types/enum';
import { abbreviateFundName } from '~shared/abbreviation';

describe('fund selectors / graph', () => {
  const today = endOfDay(new Date('2020-04-20'));
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
      items: replaceAtIndex(testState.funds.items, 3, (last) => ({
        ...last,
        transactions: replaceAtIndex(last.transactions, 0, (transaction) => ({
          ...transaction,
          drip: true,
        })),
      })),
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
              isReinvestment: true,
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
          id: numericHash('some-fund-1'),
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
          id: numericHash('some-fund-2'),
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
          id: numericHash('some-fund-3'),
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
          id: numericHash('some-fund-4'),
          item: 'test fund 4',
          color: colorKey(abbreviateFundName('test fund 4')),
          orders: [
            {
              time: getUnixTime(new Date('2016-09-21')),
              isSell: false,
              isReinvestment: true,
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
          id: numericHash('some-fund-1'),
          item: 'some fund 1',
          color: colorKey(abbreviateFundName('some fund 1')),
        }),
      ]);
    });

    it('should filter out funds with only future transactions', () => {
      expect.assertions(1);

      const stateWithFutureFund: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              ...state[PageNonStandard.Funds].items[0],
              item: 'Some future fund',
              transactions: [
                {
                  date: new Date('2020-04-21'),
                  units: 23,
                  price: 4.47826,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
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
        [FundMode.Allocation]: expect.arrayContaining([
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
      const startTime = getUnixTime(new Date('2017-04-10Z'));

      const stateWithStockSplit: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('some-fund-1'),
              item: 'some fund 1',
              transactions: [
                {
                  price: 428 * 2 * 5,
                  units: 934 / (2 * 5),
                  fees: 148,
                  taxes: 100,
                  date: new Date('2017-05-09Z'),
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [
                {
                  date: new Date('2017-07-04Z'),
                  ratio: 5,
                },
                {
                  date: new Date('2017-07-19Z'),
                  ratio: 2,
                },
              ],
            },
          ],
          startTime: getUnixTime(new Date('2017-04-10Z')),
          cacheTimes: [
            0,
            getUnixTime(new Date('2017-06-10Z')) - startTime,
            getUnixTime(new Date('2017-06-11Z')) - startTime,
            getUnixTime(new Date('2017-06-12Z')) - startTime,
            getUnixTime(new Date('2017-06-13Z')) - startTime,
            getUnixTime(new Date('2017-06-14Z')) - startTime,
            getUnixTime(new Date('2017-06-15Z')) - startTime,
            getUnixTime(new Date('2017-06-16Z')) - startTime,
            getUnixTime(new Date('2017-06-17Z')) - startTime,
            getUnixTime(new Date('2017-06-18Z')) - startTime,
            getUnixTime(new Date('2017-06-19Z')) - startTime,
            getUnixTime(new Date('2017-06-20Z')) - startTime,
            getUnixTime(new Date('2017-06-21T11:25:10Z')) - startTime,
            getUnixTime(new Date('2017-06-21T18:30:11Z')) - startTime,
            getUnixTime(new Date('2017-06-22Z')) - startTime,
            getUnixTime(new Date('2017-06-23Z')) - startTime,
            getUnixTime(new Date('2017-06-24Z')) - startTime,
            getUnixTime(new Date('2017-06-25Z')) - startTime,
            getUnixTime(new Date('2017-06-26Z')) - startTime,
            getUnixTime(new Date('2017-06-27Z')) - startTime,
            getUnixTime(new Date('2017-06-28Z')) - startTime,
            getUnixTime(new Date('2017-06-29Z')) - startTime,
            getUnixTime(new Date('2017-06-30Z')) - startTime,
            getUnixTime(new Date('2017-07-01Z')) - startTime,
            getUnixTime(new Date('2017-07-02Z')) - startTime,
            getUnixTime(new Date('2017-07-03T10:05:20Z')) - startTime,
            getUnixTime(new Date('2017-07-03T15:29:33Z')) - startTime,
            getUnixTime(new Date('2017-07-04T09:20:01Z')) - startTime,
            getUnixTime(new Date('2017-07-05Z')) - startTime,
            getUnixTime(new Date('2017-07-06Z')) - startTime,
            getUnixTime(new Date('2017-07-18Z')) - startTime,
            getUnixTime(new Date('2017-07-19T00:01:30Z')) - startTime,
            getUnixTime(new Date('2017-07-21Z')) - startTime,
            getUnixTime(new Date('2017-07-24Z')) - startTime,
          ],
          prices: {
            [numericHash('some-fund-1')]: [
              {
                values: [
                  429.5 * 2 * 5, // 13: 2017-06-21
                  429.5 * 2 * 5, // 14: 2017-06-22
                  432.3 * 2 * 5, // 15: 2017-06-23
                  434.9 * 2 * 5, // 16: 2017-06-24
                  435.7 * 2 * 5, // 17: 2017-06-25
                  437.9 * 2 * 5, // 18: 2017-06-26
                  439.6 * 2 * 5, // 19: 2017-06-27
                  436.0 * 2 * 5, // 20: 2017-06-28
                  434.9 * 2 * 5, // 21: 2017-06-29
                  432.8 * 2 * 5, // 22: 2017-06-30
                  438.4 * 2 * 5, // 23: 2017-07-01
                  435.5 * 2 * 5, // 24: 2017-07-02
                  434.9 * 2 * 5, // 25: 2017-07-03 (10:05)
                  427.9 * 2 * 5, // 26: 2017-07-03 (15:29)
                  426.3 * 2, // 27: 2017-07-04
                  424.3 * 2, // 28: 2017-07-05
                  423.1 * 2, // 29: 2017-07-06
                  427.0 * 2, // 30: 2017-07-18
                  427.9, // 31: 2017-07-19
                  430.8,
                  431.6,
                ],
                startIndex: 13,
              },
            ],
          },
        },
      };

      it('should rebase the prices for the split stock', () => {
        expect.assertions(1);

        const fundLines = getFundLines.today(today)(stateWithStockSplit);

        const splitLinePrice = fundLines[FundMode.Price].find(
          (line) => line.id === numericHash('some-fund-1'),
        );

        expect(splitLinePrice?.data).toStrictEqual([
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[13], 429.5],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[14], 429.5],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[15], 432.3],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[16], 434.9],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[17], 435.7],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[18], 437.9],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[19], 439.6],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[20], 436.0],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[21], 434.9],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[22], 432.8],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[23], 438.4],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[24], 435.5],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[25], 434.9],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[26], 427.9],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[27], 426.3], // 2017-07-04
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[28], 424.3],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[29], 423.1],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[30], 427.0],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[31], 427.9], // 2017-07-19
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[32], 430.8],
          [stateWithStockSplit[PageNonStandard.Funds].cacheTimes[33], 431.6],
        ]);
      });

      it('should use rebased prices to calculate ROI', () => {
        expect.assertions(2);

        const fundLines = getFundLines.today(today)(stateWithStockSplit);

        const splitLineROI = fundLines[FundMode.Roi].find(
          (line) => line.id === numericHash('some-fund-1'),
        );

        const timeValues = splitLineROI?.data.map(([x]) => x);
        const roiValues = splitLineROI?.data.map(([, y]) => y);

        expect(timeValues).toStrictEqual([
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[13],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[14],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[15],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[16],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[17],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[18],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[19],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[20],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[21],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[22],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[23],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[24],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[25],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[26],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[27],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[28],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[29],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[30],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[31],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[32],
          stateWithStockSplit[PageNonStandard.Funds].cacheTimes[33],
        ]);
        expect(roiValues).toMatchInlineSnapshot(`
          Array [
            0.29,
            0.29,
            0.94,
            1.55,
            1.74,
            2.25,
            2.65,
            1.81,
            1.55,
            1.06,
            2.37,
            1.69,
            1.55,
            -0.09,
            -0.46,
            -0.93,
            -1.21,
            -0.3,
            -0.09,
            0.59,
            0.78,
          ]
        `);
      });
    });

    describe('when a DRIP transaction is present', () => {
      const stateWithDRIP: State = {
        ...testState,
        [PageNonStandard.Funds]: {
          ...testState[PageNonStandard.Funds],
          startTime: getUnixTime(new Date('2017-05-13')),
          cacheTimes: [
            0, // 2017-05-13
            86400, // 2017-05-14
          ],
          items: [
            {
              id: numericHash('some-fund-1'),
              item: 'some fund 1',
              transactions: [
                {
                  date: new Date('2017-02-09'),
                  price: 428,
                  units: 934,
                  fees: 148,
                  taxes: 100,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2017-05-11'),
                  price: 413,
                  units: 25,
                  fees: 152,
                  taxes: 53,
                  drip: true,
                  pension: false,
                },
              ],
              stockSplits: [],
            },
          ],
          prices: {
            [numericHash('some-fund-1')]: [
              {
                values: [411, 413],
                startIndex: 0,
              },
            ],
          },
        },
      };

      it('should omit the unit price of the transaction from the cost', () => {
        expect.assertions(2);

        const fundLines = getFundLines.today(today)(stateWithDRIP);

        const dripLineROI = fundLines[FundMode.Roi].find(
          (line) => line.id === numericHash('some-fund-1'),
        );

        // note we don't include the units here for the DRIP transaction
        const expectedCost = 428 * 934 + 148 + 100 + 152 + 53;

        const value0 = 411 * (934 + 25);
        const value1 = 413 * (934 + 25);

        expect(dripLineROI?.data).toStrictEqual([
          [0, round((100 * (value0 - expectedCost)) / expectedCost, 2)],
          [86400, round((100 * (value1 - expectedCost)) / expectedCost, 2)],
        ]);

        expect(dripLineROI?.data.map(([, y]) => y)).toMatchInlineSnapshot(`
          Array [
            -1.51,
            -1.03,
          ]
        `);
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
      expect.assertions(2);
      const stateWithSold: State = {
        ...state,
        [PageNonStandard.Funds]: {
          ...state[PageNonStandard.Funds],
          items: [
            {
              ...state[PageNonStandard.Funds].items[0],
              transactions: [
                {
                  date: new Date('2017-05-09'),
                  units: 934,
                  price: 428.2655,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2017-07-10'),
                  units: -934,
                  price: 522.229,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2020-04-21'),
                  units: 1000,
                  price: 79.015,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
            },
            ...state[PageNonStandard.Funds].items.slice(1),
          ],
        },
      };

      const result = getFundLines.today(today)(stateWithSold);

      const overallLine = result[FundMode.Roi].find(({ id }) => id === GRAPH_FUNDS_OVERALL_ID);

      const lastOverallItem = overallLine?.data[overallLine?.data.length - 1];

      expect(lastOverallItem?.[0]).toBe(
        getUnixTime(new Date('2020-04-20T18:43:19Z')) - testStartTime,
      );

      expect(lastOverallItem).toMatchInlineSnapshot(`
        Array [
          94264060,
          65.32,
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
                  drip: false,
                  pension: false,
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
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2014-03-10'),
                  units: -105,
                  price: 88.56,
                  fees: 105,
                  taxes: 26,
                  drip: false,
                  pension: false,
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
