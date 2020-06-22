import endOfDay from 'date-fns/endOfDay';
import getUnixTime from 'date-fns/getUnixTime';
import numericHash from 'string-hash';

import { getTargets } from './graph';
import { testState as state } from '~client/test-data';

describe('Graph selectors', () => {
  describe('getTargets', () => {
    it('should get a list of savings targets', () => {
      expect.assertions(1);
      const result = getTargets(new Date('2018-03-23T11:45:20Z'))({
        ...state,
        netWorth: {
          ...state.netWorth,
          entries: {
            items: [
              {
                id: numericHash('entry-a'),
                date: new Date('2018-01-31'),
                values: [
                  {
                    id: numericHash('value-id-1'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 13502,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-b'),
                date: new Date('2018-02-28'),
                values: [
                  {
                    id: numericHash('value-id-2'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 19220,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-c'),
                date: new Date('2018-03-31'),
                values: [
                  {
                    id: numericHash('value-id-3'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 11876,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-d'),
                date: new Date('2018-04-30'),
                values: [
                  {
                    id: numericHash('value-id-4'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 14981,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-e'),
                date: new Date('2018-05-31'),
                values: [
                  {
                    id: numericHash('value-id-5'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 14230,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-f'),
                date: new Date('2018-06-30'),
                values: [
                  {
                    id: numericHash('value-id-6'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 12678,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
              {
                id: numericHash('entry-g'),
                date: new Date('2018-07-31'),
                values: [
                  {
                    id: numericHash('value-id-7'),
                    subcategory: numericHash('real-wallet-subcategory-id'),
                    value: 0,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
            ],
            __optimistic: [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
          },
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
