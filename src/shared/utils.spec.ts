import { arrayAverage, Average, omitDeep, optionalDeep } from './utils';

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
});
