/* eslint-disable max-lines */
import { removeAtIndex, replaceAtIndex } from 'replace-array';
import shortid from 'shortid';
import numericHash from 'string-hash';

import {
  exponentialRegression,
  generateFakeId,
  getTotalCost,
  getTotalUnits,
  isSold,
  lastInArray,
  leftPad,
  limitTimeSeriesLength,
  partialModification,
  randnBm,
  sortByDate,
  sortByKey,
  sortByTotal,
  toNativeFund,
  toRawFund,
  withoutId,
  withoutIds,
} from './data';
import type {
  Data,
  FundNative,
  StockSplitNative,
  TransactionNative as Transaction,
} from '~client/types';
import type { FundInput } from '~client/types/gql';

jest.mock('shortid', () => ({
  generate: (): string => 'some-shortid',
}));

describe('data module', () => {
  describe(generateFakeId.name, () => {
    it('should be numeric', () => {
      expect.assertions(1);
      expect(generateFakeId()).toStrictEqual(expect.any(Number));
    });

    it('should be negative', () => {
      expect.assertions(1);
      expect(generateFakeId()).toBeLessThan(0);
    });

    it('should be deterministic on shortid', () => {
      expect.assertions(2);

      const id0 = 'some-short-id';
      const id1 = 'other-short-id';

      jest.spyOn(shortid, 'generate').mockReturnValueOnce(id0);
      const firstId = generateFakeId();

      jest.spyOn(shortid, 'generate').mockReturnValueOnce(id0);
      const secondId = generateFakeId();

      jest.spyOn(shortid, 'generate').mockReturnValueOnce(id1);
      const idShortIdChanged = generateFakeId();

      expect(secondId).toBe(firstId);
      expect(idShortIdChanged).not.toBe(firstId);
    });
  });

  describe(lastInArray.name, () => {
    it('should get the last item in an array', () => {
      expect.assertions(1);
      expect(lastInArray([1, 2, 7, 3])).toBe(3);
    });

    describe('when the array is empty', () => {
      it('should return undefined', () => {
        expect.assertions(1);
        expect(lastInArray([])).toBeUndefined();
      });
    });
  });

  const transactionsList: Transaction[] = [
    {
      date: new Date('2017-05-09T00:00:00.000Z'),
      units: 934,
      price: 428,
      fees: 172,
      taxes: 0,
      drip: false,
      pension: false,
    },
    {
      date: new Date('2018-03-13T00:00:00.000Z'),
      units: 25,
      price: 421,
      fees: 7,
      taxes: 6,
      drip: false,
      pension: false,
    },
    {
      date: new Date('2018-06-07T00:00:00.000Z'),
      units: -1239,
      price: 436,
      fees: 390,
      taxes: 0,
      drip: false,
      pension: false,
    },
    {
      date: new Date('2018-04-26T00:00:00.000Z'),
      units: 280,
      price: 428,
      fees: 91,
      taxes: 0,
      drip: false,
      pension: false,
    },
  ];

  const stockSplitList: StockSplitNative[] = [
    { date: new Date('2020-04-01'), ratio: 3 },
    { date: new Date('2020-10-12'), ratio: 5 },
  ];

  describe(partialModification.name, () => {
    it.each`
      index | key        | newValue
      ${1}  | ${'date'}  | ${new Date('2018-03-14T00:00:00.000Z')}
      ${3}  | ${'units'} | ${281}
      ${2}  | ${'price'} | ${400}
      ${2}  | ${'fees'}  | ${150}
      ${2}  | ${'taxes'} | ${10}
    `(
      'should modify the $key of a transactions list at a specified index',
      ({
        index,
        key,
        newValue,
      }: {
        index: number;
        key: keyof Transaction;
        newValue: Transaction[keyof Transaction];
      }) => {
        expect.assertions(4);

        const modifiedTransactionsList = partialModification(transactionsList, index, {
          [key]: newValue,
        });

        expect(modifiedTransactionsList[index][key]).toStrictEqual(newValue);

        // check that the original list wasn't mutated
        expect(transactionsList[index][key]).not.toStrictEqual(
          modifiedTransactionsList[index][key],
        );

        expect(modifiedTransactionsList[index - 1]).toBe(transactionsList[index - 1]);
        expect(modifiedTransactionsList[index + 1]).toBe(transactionsList[index + 1]);
      },
    );

    it.each`
      index | key        | newValue
      ${1}  | ${'date'}  | ${new Date('2020-04-05')}
      ${0}  | ${'ratio'} | ${15}
    `(
      'should modify the $key of a stock split list at a specified index',
      ({
        index,
        key,
        newValue,
      }: {
        index: number;
        key: keyof StockSplitNative;
        newValue: StockSplitNative[keyof StockSplitNative];
      }) => {
        expect.assertions(2);

        const modifiedStockSplits = partialModification(stockSplitList, index, {
          [key]: newValue,
        });

        expect(modifiedStockSplits[index][key]).toStrictEqual(newValue);

        // check that the original list wasn't mutated
        expect(stockSplitList[index][key]).not.toStrictEqual(modifiedStockSplits[index][key]);
      },
    );
  });

  describe(getTotalUnits.name, () => {
    it('should get the sum of units in a transactions list', () => {
      expect.assertions(2);

      expect(getTotalUnits(transactionsList)).toBe(0);
      expect(getTotalUnits(removeAtIndex(transactionsList, 2))).toBe(1239);
    });

    describe('when there are stock splits', () => {
      it('should return the rebased number', () => {
        expect.assertions(1);

        expect(
          getTotalUnits(
            [
              {
                date: new Date('2020-04-10'),
                units: 110,
                price: 100,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
              {
                date: new Date('2020-04-13'),
                units: 143,
                price: 56,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
              {
                date: new Date('2020-04-20'),
                units: 95,
                price: 20,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
            ],
            [
              { date: new Date('2020-04-13'), ratio: 2 },
              { date: new Date('2020-04-17'), ratio: 3 },
            ],
          ),
        ).toBe(110 * (2 * 3) + 143 * 3 + 95);
      });
    });
  });

  describe(getTotalCost.name, () => {
    it('should get the sum of cost in a transactions list', () => {
      expect.assertions(1);

      expect(getTotalCost(transactionsList)).toBe(
        934 * 428 + 172 + 25 * 421 + 7 + 6 - 1239 * 436 + 390 + 280 * 428 + 91,
      );
    });

    it('should exclude units for DRIP transactions', () => {
      expect.assertions(1);

      expect(
        getTotalCost(replaceAtIndex(transactionsList, 0, (last) => ({ ...last, drip: true }))),
      ).toBe(172 + 25 * 421 + 7 + 6 - 1239 * 436 + 390 + 280 * 428 + 91);
    });
  });

  describe(isSold.name, () => {
    it('should determine if a transactions list represents a holding which is fully sold', () => {
      expect.assertions(2);

      expect(isSold(transactionsList)).toBe(true);
      expect(isSold(partialModification(transactionsList, 3, { units: -1238 }))).toBe(false);
    });

    it('should return false for an empty list', () => {
      expect.assertions(1);
      expect(isSold([])).toBe(false);
    });
  });

  describe(sortByTotal.name, () => {
    it('should sort items by the total attribute (descending)', () => {
      expect.assertions(1);
      expect(sortByTotal([{ total: 1, foo: 'bar' }, { total: 3 }])).toStrictEqual([
        { total: 3 },
        { total: 1, foo: 'bar' },
      ]);
    });
  });

  describe(leftPad.name, () => {
    it('should extend an array to the left', () => {
      expect.assertions(1);
      expect(leftPad(['bar', 'baz'], 5, 'foo')).toStrictEqual(['foo', 'foo', 'foo', 'bar', 'baz']);
    });

    it('should default to 0 for the fill value', () => {
      expect.assertions(1);
      expect(leftPad([6, 2, 3], 5)).toStrictEqual([0, 0, 6, 2, 3]);
    });
  });

  describe(exponentialRegression.name, () => {
    it('should return the exponential regresson slope and intercept', () => {
      expect.assertions(3);
      const line = [1, 77, 23, 103, 130];

      const { slope, intercept, points } = exponentialRegression(line);

      expect(slope).toMatchInlineSnapshot(`1.0025992467287117`);
      expect(intercept).toMatchInlineSnapshot(`0.3885148751074756`);

      expect(points).toMatchInlineSnapshot(`
        Array [
          4.019325577784265,
          10.95409510526857,
          29.85381434101613,
          81.36228708469008,
          221.74123828982772,
        ]
      `);
    });

    describe.each`
      case                             | line
      ${'all values are non-positive'} | ${[-14, 0, -0.3]}
      ${'there are no values'}         | ${[]}
    `('when $case', ({ line }) => {
      it('should return zero values', () => {
        expect.assertions(1);
        expect(exponentialRegression(line)).toStrictEqual<ReturnType<typeof exponentialRegression>>(
          {
            slope: 0,
            intercept: 0,
            logValues: [],
            points: [],
          },
        );
      });
    });
  });

  describe(limitTimeSeriesLength.name, () => {
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

  describe(randnBm.name, () => {
    it('should return a gaussian-distributed variable', () => {
      expect.assertions(2);
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.439)
        .mockReturnValueOnce(0.198)
        .mockReturnValueOnce(0.265)
        .mockReturnValueOnce(0.519);

      expect(randnBm()).toMatchInlineSnapshot(`0.4118235213611834`);
      expect(randnBm()).toMatchInlineSnapshot(`-1.6181400202841318`);
    });
  });

  describe(sortByKey.name, () => {
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

    it('should sort a list of items by a given key', () => {
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

    it('should allow reverse sorting', () => {
      expect.assertions(1);
      expect(sortByKey({ key: 'foo', order: -1 })(items.slice())).toStrictEqual([
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
        {
          foo: 1,
        },
      ]);
    });

    it('should allow different order for each key', () => {
      expect.assertions(1);
      expect(
        sortByKey(
          {
            key: 'foo',
            order: 1,
          },
          {
            key: 'bar',
            order: -1,
          },
        )(items.slice()),
      ).toStrictEqual([
        {
          foo: 1,
        },
        {
          foo: 2,
        },
        {
          foo: 3,
          bar: 'yes',
        },
        {
          foo: 3,
          bar: 'no',
        },
      ]);
    });

    it('should allow sorting by date', () => {
      expect.assertions(2);
      const itemsWithDate: { someKey: Date }[] = [
        { someKey: new Date('2020-03-10') },
        { someKey: new Date('2020-03-11') },
        { someKey: new Date('2020-01-20') },
      ];

      expect(sortByKey('someKey')(itemsWithDate)).toStrictEqual([
        { someKey: new Date('2020-01-20') },
        { someKey: new Date('2020-03-10') },
        { someKey: new Date('2020-03-11') },
      ]);
      expect(sortByKey({ key: 'someKey', order: -1 })(itemsWithDate)).toStrictEqual([
        { someKey: new Date('2020-03-11') },
        { someKey: new Date('2020-03-10') },
        { someKey: new Date('2020-01-20') },
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

  describe(sortByDate.name, () => {
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

  describe(withoutId.name, () => {
    it('should remove the ID from an object', () => {
      expect.assertions(1);
      expect(withoutId({ id: numericHash('foo'), bar: 'baz' })).toStrictEqual({ bar: 'baz' });
    });
  });

  describe(withoutIds.name, () => {
    it('should remove IDs from an array of objects', () => {
      expect.assertions(1);
      expect(
        withoutIds([
          { id: numericHash('bak'), bar: 'ban' },
          { id: numericHash('foo'), bar: 'baz' },
        ]),
      ).toStrictEqual([{ bar: 'ban' }, { bar: 'baz' }]);
    });
  });

  describe(toNativeFund.name, () => {
    it('should replace transaction date strings with native dates, and remove __typename', () => {
      expect.assertions(1);
      expect(
        toNativeFund({
          __typename: 'Fund',
          id: 123,
          item: 'Some fund',
          allocationTarget: 0.11,
          transactions: [
            {
              __typename: 'Transaction',
              date: '2020-04-20',
              units: 913,
              price: 327.59,
              fees: 99,
              taxes: 771,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [{ __typename: 'StockSplit', date: '2020-04-03', ratio: 5 }],
        }),
      ).toStrictEqual<FundNative>({
        id: 123,
        item: 'Some fund',
        allocationTarget: 0.11,
        transactions: [
          {
            date: new Date('2020-04-20'),
            units: 913,
            price: 327.59,
            fees: 99,
            taxes: 771,
            drip: false,
            pension: false,
          },
        ],
        stockSplits: [{ date: new Date('2020-04-03'), ratio: 5 }],
      });
    });
  });

  describe(toRawFund.name, () => {
    it('should replace transaction Date objects with strings', () => {
      expect.assertions(1);
      expect(
        toRawFund({
          item: 'Some fund',
          allocationTarget: 0.11,
          transactions: [
            {
              date: new Date('2020-04-20'),
              units: 913,
              price: 327.59,
              fees: 99,
              taxes: 771,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [],
        }),
      ).toStrictEqual<FundInput>({
        item: 'Some fund',
        allocationTarget: 0.11,
        transactions: [
          {
            date: '2020-04-20',
            units: 913,
            price: 327.59,
            fees: 99,
            taxes: 771,
            drip: false,
            pension: false,
          },
        ],
        stockSplits: [],
      });
    });
  });
});
