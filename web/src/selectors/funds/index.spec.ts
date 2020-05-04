import getUnixTime from 'date-fns/getUnixTime';

import { State } from '~client/reducers';
import state from '~client/test-data/state';
import {
  getFundsCachedValueAgeText,
  getFundsCachedValue,
  getFundsCost,
  getProcessedFundsRows,
  ProcessedFundsRow,
} from '.';
import { getDayGain, getDayGainAbs } from '~client/selectors/funds/gains';
import { getTransactionsList } from '~client/modules/data';

describe('Funds selectors', () => {
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

      expect(getFundsCachedValue(state)).toStrictEqual({
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

      expect(getFundsCachedValue(stateNoCache)).toStrictEqual({
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

      expect(getFundsCachedValue(stateNoPrice)).toStrictEqual({
        dayGain: getDayGain(stateNoPrice),
        dayGainAbs: getDayGainAbs(stateNoPrice),
        value: 399098.2,
        ageText: '7 months ago',
      });
    });
  });

  describe('getFundsCost', () => {
    it('should get the total fund cost, excluding sold funds', () => {
      expect.assertions(1);
      expect(getFundsCost(state)).toBe(400000);
    });
  });

  describe('getProcessedFundsRows', () => {
    it('should set gain, prices, sold and class information on each fund row', () => {
      expect.assertions(4);
      const result = getProcessedFundsRows(state);

      expect(result).toBeInstanceOf(Array);

      expect(result).toHaveLength(4);

      const match10 = result.find(({ id }) => id === '10');

      expect(match10).toStrictEqual(
        expect.objectContaining({
          id: '10',
          item: 'some fund 1',
          transactions: state.funds.items[0].transactions,
          small: false,
          sold: false,
          gain: {
            color: [255, 250, 250],
            dayGain: 0.0075,
            dayGainAbs: 2989,
            gain: -0.0023,
            gainAbs: -902,
            value: 399098.2,
          },
        }),
      );

      const match1 = result.find(({ id }: ProcessedFundsRow) => id === '1');

      expect(match1).toStrictEqual(
        expect.objectContaining({
          id: '1',
          item: 'some fund 3',
          transactions: state.funds.items[2].transactions,
          small: true,
          sold: true,
          gain: {
            color: [255, 44, 44],
            gain: -0.1027,
            gainAbs: -9240,
            value: 80760,
          },
        }),
      );
    });
  });
});
