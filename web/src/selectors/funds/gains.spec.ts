import { DateTime } from 'luxon';
import { testRows, testPrices, testStartTime, testCacheTimes } from '~client/test-data/funds';
import {
  getRowGains,
  getGainsForRow,
  getDayGain,
  getDayGainAbs,
} from '~client/selectors/funds/gains';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { Period } from '~client/constants/graph';
import { Page } from '~client/types/app';

describe('Funds selectors / gains', () => {
  const testCache = {
    startTime: testStartTime,
    cacheTimes: testCacheTimes,
    prices: testPrices,
  };

  const stateWithGains: Pick<State, Page.funds> = {
    funds: {
      viewSoldFunds: true,
      items: [
        {
          id: 'fund1',
          item: 'Some fund',
          transactions: getTransactionsList([
            { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
          ]),
        },
        {
          id: 'fund2',
          item: 'Other fund',
          transactions: getTransactionsList([
            { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
            { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
          ]),
        },
      ],
      period: Period.year1,
      cache: {
        [Period.year1]: {
          startTime: DateTime.fromISO('2019-10-10').toSeconds(),
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

      expect(result).toEqual(expectedResult);
    });

    describe('for funds with no transaction data', () => {
      const rows = [
        {
          id: 'non-existent-id',
          item: 'some fund',
          transactions: null,
        },
      ];

      it('should set the value to 0 for funds with no data', () => {
        const result = getRowGains(rows, testCache);

        expect(result).toEqual({
          'non-existent-id': {
            value: 0,
            gain: 0,
            gainAbs: 0,
          },
        });
      });

      it('should set the cost and estimated value, if there are transactions available', () => {
        const result = getRowGains(
          [
            {
              id: 'non-existent-id',
              item: 'some fund',
              transactions: getTransactionsList([
                { date: '2019-04-03', units: 345, cost: 1199 },
                { date: '2019-07-01', units: -345, cost: -1302 },
              ]),
            },
          ],
          testCache,
        );

        expect(result).toEqual({
          'non-existent-id': {
            value: 1302,
            gainAbs: 1302 - 1199,
            gain: Number(((1302 - 1199) / 1199).toFixed(5)),
          },
        });
      });

      it('should set a colour', () => {
        const rowGains = {
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
            id: '1',
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240,
          },
          5: {
            id: '5',
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622,
          },
        };

        expect(getGainsForRow(rowGains, '10')).toEqual({
          ...rowGains['10'],
          color: [255, 250, 250],
        });
        expect(getGainsForRow(rowGains, '3')).toEqual({ ...rowGains['3'], color: [163, 246, 170] });
        expect(getGainsForRow(rowGains, '1')).toEqual({ ...rowGains['1'], color: [255, 44, 44] });
        expect(getGainsForRow(rowGains, '5')).toEqual({ ...rowGains['5'], color: [0, 230, 18] });

        expect(getGainsForRow(rowGains, 'non-existent-id')).toBeFalsy();
      });

      it('should return null if there are no gain data for the fund', () => {
        const rowGains = {
          'some-id': {},
        };

        expect(getGainsForRow(rowGains, 'some-id')).toBeNull();
      });
    });

    describe('getDayGainAbs', () => {
      it('should return the absolute gain from the previous scrape', () => {
        const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;
        const valuePrev = 345 * 109 + 167 * 57.9;

        expect(getDayGainAbs(stateWithGains)).toBe(valueLatest - valuePrev);
      });
    });

    describe('getDayGain', () => {
      it('should return the gain from the previous scrape', () => {
        const costLatest = 1199 + (98503 - 130);
        const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;

        // on the second cache item, the 2019-10-27 transaction is in the future
        const costPrev = 1199 + 98503;
        const valuePrev = 345 * 109 + 167 * 57.9;

        const gainLatest = (valueLatest - costLatest) / costLatest;
        const gainPrev = (valuePrev - costPrev) / costPrev;

        const expectedDayGain = (1 + gainLatest) / (1 + gainPrev) - 1;

        expect(getDayGain(stateWithGains)).toBe(expectedDayGain);
      });

      describe('when a fund has only one scraped price', () => {
        const stateOne = {
          funds: {
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
          expect(getDayGain(stateOne)).not.toBeNaN();
        });
      });

      describe('when there are no items', () => {
        const stateNone: Pick<State, Page.funds> = {
          funds: {
            ...stateWithGains.funds,
            items: [],
            period: Period.year5,
            cache: {
              [Period.year5]: {
                startTime: DateTime.fromISO('2019-10-10').toSeconds(),
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
          expect(getDayGain(stateNone)).toBe(0);
        });
      });

      describe('when there is no cache', () => {
        const stateNoCache: Pick<State, Page.funds> = {
          funds: {
            ...stateWithGains.funds,
            items: [
              {
                id: 'fund1',
                item: 'Some fund',
                transactions: getTransactionsList([
                  { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
                ]),
              },
              {
                id: 'fund2',
                item: 'Other fund',
                transactions: getTransactionsList([
                  { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
                  { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
                ]),
              },
            ],
            period: Period.year1,
            cache: {},
          },
        };

        it('should return 0', () => {
          expect(getDayGain(stateNoCache)).toBe(0);
        });
      });

      describe('when the cache contains only one item', () => {
        const stateOneItem: Pick<State, Page.funds> = {
          funds: {
            ...stateWithGains.funds,
            items: [
              {
                id: 'fund1',
                item: 'Some fund',
                transactions: getTransactionsList([
                  { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
                ]),
              },
              {
                id: 'fund2',
                item: 'Other fund',
                transactions: getTransactionsList([
                  { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
                  { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
                ]),
              },
            ],
            period: Period.year1,
            cache: {
              [Period.year1]: {
                startTime: DateTime.fromISO('2019-10-10').toSeconds(),
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
          expect(getDayGain(stateOneItem)).toBe(0);
        });
      });
    });
  });
});
