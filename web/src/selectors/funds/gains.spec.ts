import getUnixTime from 'date-fns/getUnixTime';
import { rgb } from 'polished';

import { Period } from '~client/constants/graph';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import {
  getRowGains,
  getGainsForRow,
  getDayGain,
  getDayGainAbs,
  RowGains,
} from '~client/selectors/funds/gains';
import { testState, testRows, testPrices, testStartTime, testCacheTimes } from '~client/test-data';
import { Page } from '~client/types';

describe('Funds selectors / gains', () => {
  const testCache = {
    startTime: testStartTime,
    cacheTimes: testCacheTimes,
    prices: testPrices,
  };

  const stateWithGains: State = {
    ...testState,
    [Page.funds]: {
      viewSoldFunds: true,
      items: [
        {
          id: 'fund1',
          item: 'Some fund',
          transactions: getTransactionsList([
            { date: new Date('2019-10-09'), units: 345, cost: 1199 },
          ]),
        },
        {
          id: 'fund2',
          item: 'Other fund',
          transactions: getTransactionsList([
            { date: new Date('2019-10-01'), units: 167, cost: 98503 },
            { date: new Date('2019-10-27'), units: -23, cost: -130 },
          ]),
        },
      ],
      __optimistic: [undefined, undefined],
      period: Period.year1,
      cache: {
        [Period.year1]: {
          startTime: getUnixTime(new Date('2019-10-10')),
          cacheTimes: [0, 86400 * 5, 86400 * 32],
          prices: {
            fund1: {
              startIndex: 1,
              values: [109, 113.2],
            },
            fund2: {
              startIndex: 0,
              values: [56.2, 57.9, 49.3],
            },
          },
        },
      },
    },
  };

  describe('getRowGains', () => {
    it('should return the correct values', () => {
      expect.assertions(1);
      const result = getRowGains(testRows, testCache);

      const expectedResult = {
        10: {
          value: 399098.2,
          gain: -0.0023,
          gainAbs: -902,
          dayGain: 0.0075,
          dayGainAbs: 2989,
        },
        3: {
          value: 50300,
          gain: 0.1178,
          gainAbs: 5300,
        },
        1: {
          value: 80760,
          gain: -0.1027,
          gainAbs: -9240,
        },
        5: {
          value: 265622,
          gain: 0.3281,
          gainAbs: 65622,
        },
      };

      expect(result).toStrictEqual(expectedResult);
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

    it('should set the cost and estimated value', () => {
      expect.assertions(1);
      const result = getRowGains(
        [
          {
            id: '10',
            item: 'some fund',
            transactions: getTransactionsList([
              { date: '2019-04-03', units: 345, cost: 1199 },
              { date: '2019-07-01', units: -345, cost: -1302 },
            ]),
          },
        ],
        testCache,
      );

      expect(result).toStrictEqual({
        10: {
          value: 1302,
          gainAbs: 1302 - 1199,
          gain: Number(((1302 - 1199) / 1199).toFixed(5)),
        },
      });
    });
  });

  describe('getGainsForRow', () => {
    const rowGains: RowGains = {
      10: {
        value: 399098.2,
        gain: -0.0023,
        gainAbs: -902,
        dayGain: 0.0075,
        dayGainAbs: 2989,
      },
      3: {
        value: 50300,
        gain: 0.1178,
        gainAbs: 5300,
      },
      1: {
        value: 80760,
        gain: -0.1027,
        gainAbs: -9240,
      },
      5: {
        value: 265622,
        gain: 0.3281,
        gainAbs: 65622,
      },
      6: {
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
          ...rowGains[id as '10' | '3' | '1' | '5' | '6'],
          color: expected,
        });
      }
    });

    it('should return null if there are no gain data for the fund', () => {
      expect.assertions(1);
      expect(getGainsForRow(rowGains, 'some-id')).toBeNull();
    });
  });

  describe('getDayGainAbs', () => {
    it('should return the absolute gain from the previous scrape, taking into account cost changes', () => {
      expect.assertions(1);

      const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;
      const valuePrev = 345 * 109 + 167 * 57.9;

      const costLatest = 1199 + 98503 - 130;
      const costPrev = 1199 + 98503;

      expect(getDayGainAbs(stateWithGains)).toBe(valueLatest - valuePrev - (costLatest - costPrev));
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

      expect(getDayGain(stateWithGains)).toBe(
        (valueLatest - valuePrev - (costLatest - costPrev)) / valuePrev,
      );
    });

    describe('when a fund has only one scraped price', () => {
      const stateOne = {
        ...stateWithGains,
        [Page.funds]: {
          ...stateWithGains.funds,
          cache: {
            ...stateWithGains.funds.cache,
            period1: {
              ...stateWithGains.funds.cache[Period.year1],
              prices: {
                ...stateWithGains.funds.cache[Period.year1]?.prices,
                10: {
                  ...stateWithGains.funds.cache[Period.year1]?.prices['10'],
                  values: [427.3],
                },
              },
            },
          },
        },
      };

      it('should not be NaN', () => {
        expect.assertions(1);
        expect(getDayGain(stateOne)).not.toBeNaN();
      });
    });

    describe('when there are no items', () => {
      const stateNone: State = {
        ...stateWithGains,
        [Page.funds]: {
          ...stateWithGains[Page.funds],
          items: [],
          __optimistic: [],
          period: Period.year5,
          cache: {
            [Period.year5]: {
              startTime: getUnixTime(new Date('2019-10-10')),
              cacheTimes: [0, 86400 * 5, 86400 * 32],
              prices: {
                fund1: {
                  startIndex: 1,
                  values: [109, 113.2],
                },
                fund2: {
                  startIndex: 0,
                  values: [56.2, 57.9, 49.3],
                },
              },
            },
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
        [Page.funds]: {
          ...stateWithGains[Page.funds],
          items: [
            {
              id: 'fund1',
              item: 'Some fund',
              transactions: getTransactionsList([
                { date: new Date('2019-10-09'), units: 345, cost: 1199 },
              ]),
            },
            {
              id: 'fund2',
              item: 'Other fund',
              transactions: getTransactionsList([
                { date: new Date('2019-10-01'), units: 167, cost: 98503 },
                { date: new Date('2019-10-27'), units: -23, cost: -130 },
              ]),
            },
          ],
          period: Period.year1,
          cache: {},
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
        [Page.funds]: {
          ...stateWithGains[Page.funds],
          items: [
            {
              id: 'fund1',
              item: 'Some fund',
              transactions: getTransactionsList([
                { date: new Date('2019-10-09'), units: 345, cost: 1199 },
              ]),
            },
            {
              id: 'fund2',
              item: 'Other fund',
              transactions: getTransactionsList([
                { date: new Date('2019-10-01'), units: 167, cost: 98503 },
                { date: new Date('2019-10-27'), units: -23, cost: -130 },
              ]),
            },
          ],
          period: Period.year1,
          cache: {
            [Period.year1]: {
              startTime: getUnixTime(new Date('2019-10-10')),
              cacheTimes: [10],
              prices: {
                fund1: {
                  startIndex: 1,
                  values: [109, 113.2],
                },
                fund2: {
                  startIndex: 0,
                  values: [56.2, 57.9, 49.3],
                },
              },
            },
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
