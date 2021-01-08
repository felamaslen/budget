import getUnixTime from 'date-fns/getUnixTime';
import { rgb } from 'polished';
import numericHash from 'string-hash';

import { getRowGains, getGainsForRow, getDayGain, getDayGainAbs, RowGains } from './gains';
import { PriceCache } from './helpers';

import { fundPeriods } from '~client/constants';
import { State } from '~client/reducers';
import { testState, testRows, testPrices, testStartTime, testCacheTimes } from '~client/test-data';
import { PageNonStandard } from '~client/types/enum';

describe('Funds selectors / gains', () => {
  const testCache: PriceCache = {
    startTime: testStartTime,
    cacheTimes: testCacheTimes,
    prices: testPrices,
  };

  const stateWithGains: State = {
    ...testState,
    api: {
      ...testState.api,
      appConfig: {
        ...testState.api.appConfig,
        historyOptions: fundPeriods.year1.query,
      },
    },
    [PageNonStandard.Funds]: {
      viewSoldFunds: true,
      cashTarget: 0,
      items: [
        {
          id: numericHash('fund1'),
          item: 'Some fund',
          transactions: [
            { date: new Date('2019-10-09'), units: 345, price: 3.475, fees: 0, taxes: 0 },
          ],
          allocationTarget: 0,
        },
        {
          id: numericHash('fund2'),
          item: 'Other fund',
          transactions: [
            { date: new Date('2019-10-01'), units: 167, price: 589.838, fees: 0, taxes: 0 },
            { date: new Date('2019-10-27'), units: -23, price: 5.6522, fees: 0, taxes: 0 },
          ],
          allocationTarget: 0,
        },
      ],
      __optimistic: [undefined, undefined],
      startTime: getUnixTime(new Date('2019-10-10')),
      cacheTimes: [0, 86400 * 5, 86400 * 32],
      prices: {
        [numericHash('fund1')]: [
          {
            startIndex: 1,
            values: [109, 113.2],
          },
        ],
        [numericHash('fund2')]: [
          {
            startIndex: 0,
            values: [56.2, 57.9, 49.3],
          },
        ],
      },
      todayPrices: {},
      todayPriceFetchTime: null,
    },
  };

  describe('getRowGains', () => {
    it('should return the correct values', () => {
      expect.assertions(14);
      const result = getRowGains(testRows, testCache);

      expect(result[10]?.value).toBeCloseTo(399098.2);
      expect(result[10]?.gain).toBeCloseTo(-0.0023);
      expect(result[10]?.gainAbs).toBeCloseTo(-902);
      expect(result[10]?.dayGain).toBeCloseTo(0.0075);
      expect(result[10]?.dayGainAbs).toBeCloseTo(2989);

      expect(result[3]?.value).toBeCloseTo(50300);
      expect(result[3]?.gain).toBeCloseTo(0.1178);
      expect(result[3]?.gainAbs).toBeCloseTo(5300);

      expect(result[1]?.value).toBeCloseTo(80760);
      expect(result[1]?.gain).toBeCloseTo(-0.1027);
      expect(result[1]?.gainAbs).toBeCloseTo(-9240);

      expect(result[5]?.value).toBeCloseTo(265622);
      expect(result[5]?.gain).toBeCloseTo(0.3281);
      expect(result[5]?.gainAbs).toBeCloseTo(65622);
    });

    const emptyRows = [{ id: '10', item: 'some fund', transactions: [] }];
    const noCache = {
      ...testCache,
      prices: {},
    };
    const emptyCache = {
      ...testCache,
      prices: {
        10: { values: [] },
      },
    };

    describe.each`
      case              | rows         | cache
      ${'transactions'} | ${emptyRows} | ${undefined}
      ${'cache'}        | ${undefined} | ${noCache}
      ${'cache values'} | ${undefined} | ${emptyCache}
    `('for funds with no $case data', ({ rows = testRows, cache = testCache }) => {
      it('should return null', () => {
        expect.assertions(1);
        const result = getRowGains(rows, cache);

        expect(result).toStrictEqual(
          expect.objectContaining({
            10: null,
          }),
        );
      });
    });

    it('should set the cost, price and estimated value', () => {
      expect.assertions(4);
      const result = getRowGains(
        [
          {
            id: 10,
            item: 'some fund',
            transactions: [
              { date: new Date('2019-04-03'), units: 345, price: 3.47536, fees: 0, taxes: 0 },
              { date: new Date('2019-07-01'), units: -345, price: 3.7739, fees: 0, taxes: 0 },
            ],
            allocationTarget: 0,
          },
        ],
        testCache,
      );

      expect(result[10]?.price).toBeCloseTo(424.1); // see test data
      expect(result[10]?.gainAbs).toBeCloseTo(1302 - 1199);
      expect(result[10]?.value).toBeCloseTo(1302);
      expect(result[10]?.gain).toBeCloseTo((1302 - 1199) / 1199);
    });

    it('should use the buy cost', () => {
      expect.assertions(3);
      const result = getRowGains(
        [
          {
            id: 103,
            item: 'some fund',
            transactions: [
              { date: new Date('2020-04-20'), units: 100, price: 1.05, fees: 0, taxes: 0 },
              { date: new Date('2020-05-20'), units: -65, price: 1.8, fees: 0, taxes: 0 },
            ],
            allocationTarget: 0,
          },
        ],
        {
          startTime: 0,
          cacheTimes: [10],
          prices: {
            103: [
              {
                startIndex: 0,
                values: [1.05, 1.8],
              },
            ],
          },
        },
      );

      expect(result[103]?.value).toBeCloseTo((100 - 65) * 1.8);
      expect(result[103]?.gainAbs).toBeCloseTo((100 - 65) * 1.8 + 117 - 105);
      expect(result[103]?.gain).toBeCloseTo(((100 - 65) * 1.8 + 117 - 105) / 105);
    });
  });

  describe('getGainsForRow', () => {
    const rowGains: RowGains = {
      10: {
        price: 452,
        value: 399098.2,
        gain: -0.0023,
        gainAbs: -902,
        dayGain: 0.0075,
        dayGainAbs: 2989,
      },
      3: {
        price: 193,
        value: 50300,
        gain: 0.1178,
        gainAbs: 5300,
      },
      1: {
        price: 671,
        value: 80760,
        gain: -0.1027,
        gainAbs: -9240,
      },
      5: {
        price: 172,
        value: 265622,
        gain: 0.3281,
        gainAbs: 65622,
      },
      6: {
        price: 88,
        value: 2600,
        gain: 0,
        gainAbs: 0,
      },
      'some-id': null,
    };

    it.each`
      id           | expected
      ${10}        | ${rgb(255, 250, 250)}
      ${3}         | ${rgb(163, 246, 170)}
      ${1}         | ${rgb(255, 44, 44)}
      ${5}         | ${rgb(0, 230, 18)}
      ${6}         | ${rgb(255, 255, 255)}
      ${'NOEXIST'} | ${null}
    `('should set the correct colour for fund ID $id', ({ id, expected }) => {
      expect.assertions(1);
      if (expected === null) {
        expect(getGainsForRow(rowGains, id)).toBeNull();
      } else {
        expect(getGainsForRow(rowGains, id)).toStrictEqual({
          ...rowGains[id as 10 | 3 | 1 | 5 | 6],
          color: expected,
        });
      }
    });

    it('should return null if there are no gain data for the fund', () => {
      expect.assertions(1);
      expect(getGainsForRow(rowGains, numericHash('some-id'))).toBeNull();
    });
  });

  describe('getDayGainAbs', () => {
    it('should return the absolute gain from the previous scrape, taking into account cost changes', () => {
      expect.assertions(1);

      const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;
      const valuePrev = 345 * 109 + 167 * 57.9;

      const costLatest = 1199 + 98503 - 130;
      const costPrev = 1199 + 98503;

      expect(getDayGainAbs(stateWithGains)).toBeCloseTo(
        valueLatest - valuePrev - (costLatest - costPrev),
      );
    });

    describe('when the latest price is missing for a fund', () => {
      const stateWithMissingLatestPrice: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          prices: {
            ...stateWithGains[PageNonStandard.Funds].prices,
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109],
              },
            ],
          },
        },
      };

      it('should use the latest available price for the fund', () => {
        expect.assertions(1);

        const valueLatest = 345 * 109 + (167 - 23) * 49.3;
        const valuePrev = 345 * 109 + 167 * 57.9;

        const costLatest = 1199 + 98503 - 130;
        const costPrev = 1199 + 98503;

        expect(getDayGainAbs(stateWithMissingLatestPrice)).toBeCloseTo(
          valueLatest - valuePrev - (costLatest - costPrev),
        );
      });
    });
  });

  describe('getDayGain', () => {
    it('should return the gain from the previous scrape, taking into account cost changes', () => {
      expect.assertions(1);
      const costLatest = 1199 + (98503 - 130);
      const costPrev = 1199 + 98503;

      const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;

      // on the second cache item, the 2019-10-27 transaction is in the future
      const valuePrev = 345 * 109 + 167 * 57.9;

      expect(getDayGain(stateWithGains)).toBeCloseTo(
        (valueLatest - valuePrev - (costLatest - costPrev)) / valuePrev,
      );
    });

    describe('when a fund has only one scraped price', () => {
      const stateOne = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains.funds,
          prices: {
            ...stateWithGains.funds.prices,
            [numericHash('fund1')]: [
              {
                ...stateWithGains.funds.prices[numericHash('fund1')][0],
                values: [427.3],
              },
            ],
          },
        },
      };

      it('should not be NaN', () => {
        expect.assertions(1);
        const result = getDayGain(stateOne);
        expect(result).not.toBeNaN();
      });
    });

    describe('when there are no items', () => {
      const stateNone: State = {
        ...stateWithGains,
        api: {
          ...testState.api,
          appConfig: {
            ...testState.api.appConfig,
            historyOptions: fundPeriods.year5.query,
          },
        },
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [],
          __optimistic: [],
          startTime: getUnixTime(new Date('2019-10-10')),
          cacheTimes: [0, 86400 * 5, 86400 * 32],
          prices: {
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109, 113.2],
              },
            ],
            [numericHash('fund2')]: [
              {
                startIndex: 0,
                values: [56.2, 57.9, 49.3],
              },
            ],
          },
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateNone)).toBe(0);
      });
    });

    describe('when there is no cache', () => {
      const stateNoCache: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund1'),
              item: 'Some fund',
              transactions: [
                { date: new Date('2019-10-09'), units: 345, price: 3.47536, fees: 0, taxes: 0 },
              ],
              allocationTarget: 0,
            },
            {
              id: numericHash('fund2'),
              item: 'Other fund',
              transactions: [
                { date: new Date('2019-10-01'), units: 167, price: 589.838, fees: 0, taxes: 0 },
                { date: new Date('2019-10-27'), units: -23, price: 5.65217, fees: 0, taxes: 0 },
              ],
              allocationTarget: 0,
            },
          ],
          prices: {},
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateNoCache)).toBe(0);
      });
    });

    describe('when the cache contains only one item', () => {
      const stateOneItem: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund1'),
              item: 'Some fund',
              transactions: [
                { date: new Date('2019-10-09'), units: 345, price: 3.47536, fees: 0, taxes: 0 },
              ],
              allocationTarget: 0,
            },
            {
              id: numericHash('fund2'),
              item: 'Other fund',
              transactions: [
                { date: new Date('2019-10-01'), units: 167, price: 589.838, fees: 0, taxes: 0 },
                { date: new Date('2019-10-27'), units: -23, price: 5.65217, fees: 0, taxes: 0 },
              ],
              allocationTarget: 0,
            },
          ],
          startTime: getUnixTime(new Date('2019-10-10')),
          cacheTimes: [10],
          prices: {
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109, 113.2],
              },
            ],
            [numericHash('fund2')]: [
              {
                startIndex: 0,
                values: [56.2, 57.9, 49.3],
              },
            ],
          },
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateOneItem)).toBe(0);
      });
    });
  });
});
