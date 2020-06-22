import addDays from 'date-fns/addDays';
import getUnixTime from 'date-fns/getUnixTime';

import {
  getFundsCachedValueAgeText,
  getFundsCachedValue,
  getFundsCost,
  getPortfolio,
  getDayGain,
  getDayGainAbs,
} from '.';
import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { testState as state } from '~client/test-data/state';
import { Page, Portfolio } from '~client/types';

describe('Funds selectors', () => {
  const testNow = new Date('2018-03-23T11:45:20Z');

  const testToday = new Date('2020-04-20');

  const stateWithOnlyFutureTransaction: State = {
    ...state,
    [Page.funds]: {
      ...state[Page.funds],
      items: [
        {
          ...state[Page.funds].items[0],
          id: 10,
          transactions: getTransactionsList([
            {
              ...state[Page.funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ]),
        },
        {
          ...state[Page.funds].items[1],
          id: 3,
        },
      ],
    },
  };

  const stateWithFutureTransaction: State = {
    ...state,
    [Page.funds]: {
      ...state[Page.funds],
      items: [
        {
          ...state[Page.funds].items[0],
          id: 10,
          transactions: getTransactionsList([
            ...state[Page.funds].items[0].transactions,
            {
              ...state[Page.funds].items[0].transactions[0],
              date: addDays(testToday, 1),
            },
          ]),
        },
        ...state[Page.funds].items.slice(1),
      ],
    },
  };

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

    const itemsWithoutPriceData = [
      ...state[Page.funds].items,
      {
        id: 'some-id',
        item: 'new fund',
        transactions: getTransactionsList([{ date: '2019-07-23', units: 13, cost: 12 }]),
      },
    ];

    const itemsWithFutureTransaction = [
      {
        ...state[Page.funds].items[0],
        transactions: getTransactionsList([
          ...state[Page.funds].items[0].transactions,
          {
            date: addDays(testNow, 1),
            units: 1000,
            cost: 100,
          },
        ]),
      },
      ...state[Page.funds].items.slice(1),
    ];

    it.each`
      condition                       | items
      ${'funds without price data'}   | ${itemsWithoutPriceData}
      ${'transactions in the future'} | ${itemsWithFutureTransaction}
    `('should skip $condition', ({ items }) => {
      expect.assertions(1);
      const stateNoPrice = {
        ...state,
        [Page.funds]: {
          ...state[Page.funds],
          items,
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
      expect(getFundsCost(testToday)(state)).toBe(
        400000 + 45000 - 50300 + 90000 - 80760 + 200000 - 265622,
      );
    });

    it('should ignore future transactions', () => {
      expect.assertions(1);
      expect(getFundsCost(testToday)(stateWithFutureTransaction)).toBe(
        getFundsCost(testToday)(state),
      );
    });
  });

  describe('getPortfolio', () => {
    it('should get the latest value for every fund, where available', () => {
      expect.assertions(1);

      const result = getPortfolio(new Date('2020-04-20'))(state);

      expect(result).toStrictEqual<Portfolio>([
        {
          id: 10,
          item: 'some fund 1',
          value: 399098.2,
        },
        {
          id: 3,
          item: 'some fund 2',
          value: 0,
        },
        {
          id: 1,
          item: 'some fund 3',
          value: 0,
        },
        {
          id: 5,
          item: 'test fund 4',
          value: 0,
        },
      ]);
    });

    it('should not include fund transactions from the future', () => {
      expect.assertions(1);

      const result = getPortfolio(testToday)(stateWithOnlyFutureTransaction);

      expect(result.find(({ id }) => id === 10)).toBeUndefined();
    });
  });
});
