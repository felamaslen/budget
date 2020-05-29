import getUnixTime from 'date-fns/getUnixTime';

import {
  getFundsCachedValueAgeText,
  getFundsCachedValue,
  getFundsCost,
  getAllLatestValues,
  getDayGain,
  getDayGainAbs,
} from '.';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';

describe('Funds selectors', () => {
  const testNow = new Date('2018-03-23T11:45:20Z');

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
    it('should get an age text and value', () => {
      expect.assertions(1);
      const expectedValue = 399098.2;
      const expectedAgeText = '7 months ago';

      expect(getFundsCachedValue(testNow)(state)).toStrictEqual({
        value: expectedValue,
        ageText: expectedAgeText,
        dayGain: getDayGain(state),
        dayGainAbs: getDayGainAbs(state),
      });
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
        dayGain: getDayGain(stateNoCache),
        dayGainAbs: getDayGainAbs(stateNoCache),
        value: 0,
        ageText: '',
      });
    });

    it('should skip funds without price data', () => {
      expect.assertions(1);
      const stateNoPrice = {
        ...state,
        funds: {
          ...state.funds,
          items: [
            ...state.funds.items,
            {
              id: 'some-id',
              item: 'new fund',
              transactions: getTransactionsList([{ date: '2019-07-23', units: 13, cost: 12 }]),
            },
          ],
        },
      };

      expect(getFundsCachedValue(testNow)(stateNoPrice)).toStrictEqual({
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
      expect(getFundsCost(state)).toBe(400000 + 45000 - 50300 + 90000 - 80760 + 200000 - 265622);
    });
  });

  describe('getAllLatestValues', () => {
    it('should get the latest value for every fund, where available', () => {
      expect.assertions(1);

      const result = getAllLatestValues(state);

      expect(result).toStrictEqual([
        {
          id: '10',
          item: 'some fund 1',
          value: 399098.2,
        },
        {
          id: '3',
          item: 'some fund 2',
          value: 0,
        },
        {
          id: '1',
          item: 'some fund 3',
          value: 0,
        },
        {
          id: '5',
          item: 'test fund 4',
          value: 0,
        },
      ]);
    });
  });
});
