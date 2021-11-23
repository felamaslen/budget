import {
  arrayAverage,
  Average,
  omitDeep,
  optionalDeep,
  withNativeDate,
  withRawDate,
} from './utils';

describe('shared utils', () => {
  describe(omitDeep.name, () => {
    it('should remove the given key from an object, including arrays, recursively', () => {
      expect.assertions(1);
      expect(
        omitDeep(
          {
            foo: 'bar',
            id: 2,
            things: [{ bar: 'baz', id: 1 }, { bak: 'thing' }],
          },
          'id',
        ),
      ).toStrictEqual({
        foo: 'bar',
        things: [{ bar: 'baz' }, { bak: 'thing' }],
      });
    });
  });

  describe(optionalDeep.name, () => {
    it('should remove null values of the given key from an object, including arrays, recursively', () => {
      expect.assertions(1);
      expect(
        optionalDeep(
          {
            foo: 'bar',
            id: 2,
            things: [
              { bar: 'baz', id: 1 },
              { bak: 'thing', id: null },
              { fizz: 'buzz', id: undefined },
            ],
          },
          'id',
        ),
      ).toStrictEqual({
        foo: 'bar',
        id: 2,
        things: [{ bar: 'baz', id: 1 }, { bak: 'thing' }, { fizz: 'buzz', id: undefined }],
      });
    });
  });

  describe(arrayAverage.name, () => {
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

  describe(withNativeDate.name, () => {
    it('should convert all the given keys to native dates', () => {
      expect.assertions(1);
      expect(
        withNativeDate<
          'a' | 'keyb',
          {
            a: string;
            keyb: string;
            c: string;
            d: string;
            e: number;
          }
        >(
          'a',
          'keyb',
        )({
          a: '2020-04-20',
          keyb: '2020-04-30',
          c: '2020-04-02',
          d: 'not a date',
          e: 25,
        }),
      ).toStrictEqual({
        a: new Date('2020-04-20'),
        keyb: new Date('2020-04-30'),
        c: '2020-04-02',
        d: 'not a date',
        e: 25,
      });
    });
  });

  describe(withRawDate.name, () => {
    it('should convert all the given keys to raw dates', () => {
      expect.assertions(1);
      expect(
        withRawDate<
          'a' | 'keyb',
          {
            a: Date;
            keyb: Date;
            c: Date;
            d: string;
            e: number;
          }
        >(
          'a',
          'keyb',
        )({
          a: new Date('2020-04-20'),
          keyb: new Date('2020-04-30'),
          c: new Date('2020-04-02'),
          d: 'not a date',
          e: 25,
        }),
      ).toStrictEqual({
        a: '2020-04-20',
        keyb: '2020-04-30',
        c: new Date('2020-04-02'),
        d: 'not a date',
        e: 25,
      });
    });
  });
});
