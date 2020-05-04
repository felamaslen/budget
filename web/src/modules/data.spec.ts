/* eslint-disable max-lines */
import shortid from 'shortid';
import { removeAtIndex } from 'replace-array';

import {
  getPeriodMatch,
  getTransactionsList,
  formatTransactionsList,
  addToTransactionsList,
  modifyTransaction,
  modifyTransactionById,
  getTotalUnits,
  getTotalCost,
  isSold,
  arrayAverage,
  sortByTotal,
  limitTimeSeriesLength,
  randnBm,
  getValueFromTransmit,
  getValueForTransmit,
  sortByDate,
  sortByKey,
  withoutDeleted,
} from './data';
import { mockRandom } from '~client/mocks/random';
import { Average } from '~client/constants';
import { RequestType } from '~client/types/crud';
import { Data } from '~client/types/graph';

describe('data module', () => {
  describe('getPeriodMatch', () => {
    const envBefore = process.env.DEFAULT_FUND_PERIOD ?? '';
    beforeEach(() => {
      process.env.DEFAULT_FUND_PERIOD = 'year11';
    });
    afterEach(() => {
      process.env.DEFAULT_FUND_PERIOD = envBefore;
    });

    it('should return env variable by default', () => {
      expect.assertions(1);
      expect(getPeriodMatch('foo')).toStrictEqual({ period: 'year', length: 11 });
    });

    it('should split up a short period representation', () => {
      expect.assertions(2);
      expect(getPeriodMatch('month5')).toStrictEqual({ period: 'month', length: 5 });
      expect(getPeriodMatch('year10')).toStrictEqual({ period: 'year', length: 10 });
    });

    it('should handle the case when the env variable is not a match', () => {
      expect.assertions(1);
      process.env.DEFAULT_FUND_PERIOD = 'gobbledegook';
      expect(getPeriodMatch('foo')).toStrictEqual({ period: 'year', length: 1 });
    });
  });

  const transactionsData = [
    {
      date: '2017-05-09T00:00:00.000Z',
      units: 934,
      cost: 399924,
    },
    {
      date: '2018-03-13T00:00:00.000Z',
      units: 25,
      cost: -10512,
    },
    {
      date: '2018-06-07T00:00:00.000Z',
      units: -1239,
      cost: -539814,
    },
    {
      date: '2018-04-26T00:00:00.000Z',
      units: 280,
      cost: 119931,
    },
  ];

  describe('getTransactionsList', () => {
    it('should make a list from API response data', () => {
      expect.assertions(1);
      const transactionsList = getTransactionsList(transactionsData);

      expect(transactionsList).toStrictEqual([
        expect.objectContaining({
          date: new Date('2017-05-09T00:00:00.000Z'),
          units: 934,
          cost: 399924,
        }),
        expect.objectContaining({
          date: new Date('2018-03-13T00:00:00.000Z'),
          units: 25,
          cost: -10512,
        }),
        expect.objectContaining({
          date: new Date('2018-06-07T00:00:00.000Z'),
          units: -1239,
          cost: -539814,
        }),
        expect.objectContaining({
          date: new Date('2018-04-26T00:00:00.000Z'),
          units: 280,
          cost: 119931,
        }),
      ]);
    });

    it('should add fake IDs to each item', () => {
      expect.assertions(1);
      const spy = jest.spyOn(shortid, 'generate').mockReturnValue('some-shortid');

      const transactionsList = getTransactionsList(transactionsData);
      expect(transactionsList).toStrictEqual(
        transactionsData.map(() => expect.objectContaining({ id: 'some-shortid' })),
      );

      spy.mockRestore();
    });

    it('should handle rounding errors', () => {
      expect.assertions(2);
      // this example is a real world example which presented rounding errors
      const listWithErrors = getTransactionsList([
        {
          date: '2016-09-19T05:00Z',
          units: 1678.42,
          cost: 2000,
        },
        {
          date: '2017-02-14T05:00Z',
          units: 846.38,
          cost: 1000,
        },
        {
          date: '2017-10-25T05:00Z',
          units: 817,
          cost: 1000,
        },
        {
          date: '2018-03-14T05:00Z',
          units: 1217.43,
          cost: 1500,
        },
        {
          date: '2018-09-24T05:00Z',
          units: -4559.23,
          cost: -5595.2,
        },
      ]);

      expect(getTotalUnits(listWithErrors)).toBe(0);

      expect(isSold(listWithErrors)).toBe(true);
    });
  });

  describe('formatTransactionsList', () => {
    it('should return the array without IDs, ordered by date', () => {
      expect.assertions(1);
      const transactionsList = getTransactionsList(transactionsData);
      const transactionsListFormatted = formatTransactionsList(transactionsList);

      expect(transactionsListFormatted).toStrictEqual([
        {
          date: '2017-05-09',
          units: 934,
          cost: 399924,
        },
        {
          date: '2018-03-13',
          units: 25,
          cost: -10512,
        },
        {
          date: '2018-04-26',
          units: 280,
          cost: 119931,
        },
        {
          date: '2018-06-07',
          units: -1239,
          cost: -539814,
        },
      ]);
    });

    it('should not mutate the original value', () => {
      expect.assertions(1);
      const transactionsList = getTransactionsList(transactionsData);
      const copy = transactionsList.slice();
      formatTransactionsList(transactionsList);

      expect(transactionsList).toStrictEqual(copy);
    });
  });

  describe('addToTransactionsList', () => {
    it('should add a list item from API-like data', () => {
      expect.assertions(2);

      const transactionsList = getTransactionsList(transactionsData);

      const transactionsListAdded = addToTransactionsList(transactionsList, {
        date: new Date('2018-09-13T03:20Z'),
        units: 20,
        cost: 3,
      });

      expect(transactionsListAdded).toHaveLength(transactionsData.length + 1);

      expect(transactionsListAdded[transactionsListAdded.length - 1]).toStrictEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^([^\s]{7})/),
          date: new Date('2018-09-13T03:20Z'),
          units: 20,
          cost: 3,
        }),
      );
    });
  });

  describe('modifyTransaction', () => {
    it('should modify a transaction list at a specified index', () => {
      expect.assertions(6);
      const transactionsList = getTransactionsList(transactionsData);

      const modifiedDate = modifyTransaction(transactionsList, 1, {
        date: new Date('2018-03-14T00:00:00.000Z'),
      });

      expect(modifiedDate[1].date.getDate()).toBe(14);

      const modifiedUnits = modifyTransaction(transactionsList, 3, { units: 281 });

      expect(modifiedUnits[3].units).toBe(281);

      const modifiedCost = modifyTransaction(transactionsList, 2, { cost: -100 });

      expect(modifiedCost[2].cost).toBe(-100);

      // check that the original list wasn't mutated
      expect(transactionsList[1].date.getDate()).toBe(13);
      expect(transactionsList[3].units).toBe(280);
      expect(transactionsList[2].cost).toBe(-539814);
    });
  });

  describe('modifyTransactionById', () => {
    it('should modify a transaction list at a specified id', () => {
      expect.assertions(6);
      const transactionsList = getTransactionsList(transactionsData);

      const id1 = transactionsList[1].id;
      const id2 = transactionsList[2].id;
      const id3 = transactionsList[3].id;

      const modifiedDate = modifyTransactionById(transactionsList, id1, {
        date: new Date('2018-03-14T00:00:00.000Z'),
      });

      expect(modifiedDate[1].date).toStrictEqual(new Date('2018-03-14T00:00:00.000Z'));

      const modifiedUnits = modifyTransactionById(transactionsList, id3, { units: 281 });

      expect(modifiedUnits[3].units).toBe(281);

      const modifiedCost = modifyTransactionById(transactionsList, id2, { cost: -100 });

      expect(modifiedCost[2].cost).toBe(-100);

      // check that the original list wasn't mutated
      expect(transactionsList[1].date.getDate()).toBe(13);
      expect(transactionsList[3].units).toBe(280);
      expect(transactionsList[2].cost).toBe(-539814);
    });
  });

  describe('getTotalUnits', () => {
    it('should get the sum of units in a transactions list', () => {
      expect.assertions(2);

      const transactionsList = getTransactionsList(transactionsData);
      expect(getTotalUnits(transactionsList)).toBe(0);
      expect(getTotalUnits(removeAtIndex(transactionsList, 2))).toBe(1239);
    });
  });

  describe('getTotalCost', () => {
    it('should get the sum of cost in a transactions list', () => {
      expect.assertions(1);

      const transactionsList = getTransactionsList(transactionsData);
      expect(getTotalCost(transactionsList)).toBe(-30471);
    });
  });

  describe('getSold', () => {
    it('should determine if a transactions list represents a holding which is fully sold', () => {
      expect.assertions(2);

      const transactionsList = getTransactionsList(transactionsData);

      expect(isSold(transactionsList)).toBe(true);
      expect(isSold(modifyTransaction(transactionsList, 3, { units: -1238 }))).toBe(false);
    });
  });

  describe('sortByTotal', () => {
    it('should sort items by the total attribute (descending)', () => {
      expect.assertions(1);
      expect(sortByTotal([{ total: 1, foo: 'bar' }, { total: 3 }])).toStrictEqual([
        { total: 3 },
        { total: 1, foo: 'bar' },
      ]);
    });
  });

  describe('arrayAverage', () => {
    it('should get the median of a list of data', () => {
      expect.assertions(2);
      expect(arrayAverage([1, 2, 5, 10, 10, 11, 9, 3, 20], Average.Median)).toBe(9);
      expect(arrayAverage([1, 5, 10, 10, 11, 9, 3, 20], Average.Median)).toBe(9.5);
    });

    it('should get an exponential average for a list of data', () => {
      expect.assertions(1);
      const theList = [1, 2, 5, 10, 10, 11, 9, 3, 20];

      const averageExp = 13.105675146771038;

      expect(arrayAverage(theList, Average.Exp)).toBe(averageExp);
    });

    it('should get the mean by default', () => {
      expect.assertions(2);

      expect(arrayAverage([1, 2, 5, 10, 10, 11, 9, 3, 20])).toBe(71 / 9);
      expect(arrayAverage([1, 5, 10, 10, 11, 9, 3, 20])).toBe(8.625);
    });

    it('should not mutate the array', () => {
      expect.assertions(1);

      const values = [1, 7, 3, 9];
      arrayAverage(values, Average.Median);
      expect(values).toStrictEqual([1, 7, 3, 9]);
    });

    it('should handle the case when the array is empty', () => {
      expect.assertions(1);
      expect(arrayAverage([])).toBeNaN();
    });
  });

  describe('limitTimeSeriesLength', () => {
    it('should filter time series according to a least-distance algorithm', () => {
      expect.assertions(2);

      const series: Data = [
        [1, 10110],
        [1.9, 19092],
        [3, 99123],
        [4.2, 82782],
        [5.8, 11823],
        [6.9, 88123],
        [8.1, 12939],
        [9, 99123],
        [10.1, 91723],
        [11.5, 91231],
      ];

      const result = limitTimeSeriesLength(series, 3);

      expect(result).toStrictEqual([
        [4.2, 82782],
        [6.9, 88123],
        [11.5, 91231],
      ]);

      const resultLong = limitTimeSeriesLength(series, 6);

      expect(resultLong).toStrictEqual([
        [3, 99123],
        [4.2, 82782],
        [5.8, 11823],
        [6.9, 88123],
        [10.1, 91723],
        [11.5, 91231],
      ]);
    });
  });

  describe('randnBm', () => {
    it('should return a Gaussian-incremented value from two random numbers', () => {
      expect.assertions(1);
      mockRandom();
      expect(randnBm()).toBe(Math.sqrt(-2 * Math.log(0.36123)) * Math.cos(2 * Math.PI * 0.96951));
    });
  });

  describe('getValueFromTransmit', () => {
    it('should return "date" as a Date object', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('date', '2019-06-05')).toStrictEqual(new Date('2019-06-05'));
    });

    it('should return "item" as-is', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('item', 'some-item')).toStrictEqual('some-item');
    });

    it('should return "category" as-is', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('category', 'some-category')).toStrictEqual('some-category');
    });

    it('should return "holiday" as-is', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('holiday', 'some-holiday')).toStrictEqual('some-holiday');
    });

    it('should return "social" as-is', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('social', 'some-social')).toStrictEqual('some-social');
    });

    it('should return "shop" as-is', () => {
      expect.assertions(1);
      expect(getValueFromTransmit('shop', 'some-shop')).toStrictEqual('some-shop');
    });

    it('should return "cost" as an integer', () => {
      expect.assertions(4);
      expect(getValueFromTransmit('cost', 123)).toStrictEqual(123);
      expect(getValueFromTransmit('cost', 123.45)).toStrictEqual(123);
      expect(getValueFromTransmit('cost', '123.45')).toStrictEqual(123);
      expect(getValueFromTransmit('cost', 'not a number')).toStrictEqual(0);
    });

    it('should return "transactions" as a transactions list', () => {
      expect.assertions(1);

      const spy = jest.spyOn(shortid, 'generate').mockReturnValue('fake-id');

      const transactions = [{ date: '2017-09-01', units: 2.5, cost: 1 }];

      expect(getValueFromTransmit('transactions', transactions)).toStrictEqual(
        getTransactionsList(transactions),
      );

      spy.mockReset();
    });
  });

  describe('getValueForTransmit', () => {
    it('should return date as an ISO date string', () => {
      expect.assertions(1);
      expect(getValueForTransmit('date', new Date('2019-06-05'))).toBe('2019-06-05');
    });

    it('should return "item" as-is', () => {
      expect.assertions(1);
      expect(getValueForTransmit('item', 'some-item')).toStrictEqual('some-item');
    });

    it('should return "category" as-is', () => {
      expect.assertions(1);
      expect(getValueForTransmit('category', 'some-category')).toStrictEqual('some-category');
    });

    it('should return "holiday" as-is', () => {
      expect.assertions(1);
      expect(getValueForTransmit('holiday', 'some-holiday')).toStrictEqual('some-holiday');
    });

    it('should return "social" as-is', () => {
      expect.assertions(1);
      expect(getValueForTransmit('social', 'some-social')).toStrictEqual('some-social');
    });

    it('should return "shop" as-is', () => {
      expect.assertions(1);
      expect(getValueForTransmit('shop', 'some-shop')).toStrictEqual('some-shop');
    });

    it('should return cost as an integer', () => {
      expect.assertions(2);
      expect(getValueForTransmit('cost', 123)).toStrictEqual(123);
      expect(getValueForTransmit('cost', 123.45)).toStrictEqual(123);
    });

    it('should return transactions as a simple array', () => {
      expect.assertions(1);
      const transactions = [{ date: '2017-09-01', units: 2.5, cost: 1 }];

      expect(getValueForTransmit('transactions', getTransactionsList(transactions))).toStrictEqual(
        transactions,
      );
    });
  });

  describe('sortByKey', () => {
    const items: { foo: number; bar?: string }[] = [
      {
        foo: 1,
      },
      {
        foo: 3,
        bar: 'no',
      },
      {
        foo: 3,
        bar: 'yes',
      },
      {
        foo: 2,
      },
    ];

    it('should sort a list of items by date', () => {
      expect.assertions(1);
      expect(sortByKey('foo')(items.slice())).toStrictEqual([
        {
          foo: 1,
        },
        {
          foo: 2,
        },
        {
          foo: 3,
          bar: 'no',
        },
        {
          foo: 3,
          bar: 'yes',
        },
      ]);
    });

    it('should not mutate the original array', () => {
      expect.assertions(1);
      const original = [{ foo: 2 }, { foo: 1 }];
      const copy = [...original];
      sortByKey<'foo', { foo: number }>('foo')(original);
      expect(original).toStrictEqual(copy);
    });
  });

  describe('sortByDate', () => {
    const items = [
      {
        date: new Date('2020-04-20'),
      },
      {
        date: new Date('2020-03-19'),
      },
      {
        date: new Date('2020-03-19T00:00:00.001'),
      },
    ];

    it('should sort a list of items by date', () => {
      expect.assertions(1);
      expect(sortByDate(items)).toStrictEqual([
        {
          date: new Date('2020-03-19'),
        },
        {
          date: new Date('2020-03-19T00:00:00.001'),
        },
        {
          date: new Date('2020-04-20'),
        },
      ]);
    });

    it('should accept strings as dates', () => {
      expect.assertions(1);
      expect(
        sortByDate([
          {
            date: new Date('2020-04-20'),
          },
          {
            date: '2020-03-19',
          },
        ]),
      ).toStrictEqual([
        {
          date: '2020-03-19',
        },
        {
          date: new Date('2020-04-20'),
        },
      ]);
    });

    it('should not mutate the original array', () => {
      expect.assertions(1);
      const copy = items.slice();
      sortByDate(items);
      expect(items).toStrictEqual(copy);
    });
  });

  describe('withoutDeleted', () => {
    it('should remove optimistically deleted items', () => {
      expect.assertions(1);
      expect(
        withoutDeleted([
          { foo: 3 },
          { foo: 6, __optimistic: RequestType.delete },
          { foo: 4, __optimistic: RequestType.create },
          { foo: 5, __optimistic: RequestType.update },
        ]),
      ).toStrictEqual([
        { foo: 3 },
        { foo: 4, __optimistic: RequestType.create },
        { foo: 5, __optimistic: RequestType.update },
      ]);
    });
  });
});
