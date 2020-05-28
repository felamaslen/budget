import endOfDay from 'date-fns/endOfDay';
import getUnixTime from 'date-fns/getUnixTime';

import { getTargets } from './graph';
import { testState as state } from '~client/test-data/state';

describe('Graph selectors', () => {
  describe('getTargets', () => {
    it('should get a list of savings targets', () => {
      expect.assertions(1);
      const result = getTargets({
        ...state,
        netWorth: {
          ...state.netWorth,
          entries: [
            {
              id: 'entry-a',
              date: new Date('2018-01-31'),
              values: [
                { id: 'value-id-1', subcategory: 'real-wallet-subcategory-id', value: 13502 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-b',
              date: new Date('2018-02-28'),
              values: [
                { id: 'value-id-2', subcategory: 'real-wallet-subcategory-id', value: 19220 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-c',
              date: new Date('2018-03-31'),
              values: [
                { id: 'value-id-3', subcategory: 'real-wallet-subcategory-id', value: 11876 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-d',
              date: new Date('2018-04-30'),
              values: [
                { id: 'value-id-4', subcategory: 'real-wallet-subcategory-id', value: 14981 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-e',
              date: new Date('2018-05-31'),
              values: [
                { id: 'value-id-5', subcategory: 'real-wallet-subcategory-id', value: 14230 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-f',
              date: new Date('2018-06-30'),
              values: [
                { id: 'value-id-6', subcategory: 'real-wallet-subcategory-id', value: 12678 },
              ],
              creditLimit: [],
              currencies: [],
            },
            {
              id: 'entry-g',
              date: new Date('2018-07-31'),
              values: [{ id: 'value-id-7', subcategory: 'real-wallet-subcategory-id', value: 0 }],
              creditLimit: [],
              currencies: [],
            },
          ],
        },
      });

      expect(result).toStrictEqual([
        {
          date: getUnixTime(endOfDay(new Date('2018-01-31'))),
          from: 13502,
          months: 12,
          last: 3,
          tag: '1y',
          value: 73434.5,
        },
        {
          date: getUnixTime(endOfDay(new Date('2018-05-31'))),
          from: 14230,
          months: 36,
          last: 6,
          tag: '3y',
          value: 75239.20000000001,
        },
        {
          date: getUnixTime(endOfDay(new Date('2018-06-30'))),
          from: 12678,
          months: 60,
          last: 12,
          tag: '5y',
          value: 70376 + 2 / 11,
        },
      ]);
    });
  });
});
