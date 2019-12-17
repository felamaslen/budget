import {
  replaceAtIndex,
  removeAtIndex,
  AVERAGE_MEDIAN,
  AVERAGE_EXP,
  average,
  sortByKey,
  pad,
} from '~/modules/array';

test('replaceAtIndex replaces an array item at a specified index', () => {
  expect.assertions(1);
  expect(replaceAtIndex([1, 5, 7, 3, 2], 1, 3.2)).toStrictEqual([1, 3.2, 7, 3, 2]);
});

test("replaceAtIndex doesn't modify the array if the index is -1", () => {
  expect.assertions(1);
  const array: number[] = [1, 6, 9, 3, 10];

  expect(replaceAtIndex<number>(array, -1, 7)).toStrictEqual(array);
});

test('replaceAtIndex accepts a function to replace the previous value', () => {
  expect.assertions(1);
  expect(replaceAtIndex([1, 5, 7, 3, 2], 1, value => value ** 2)).toStrictEqual([1, 25, 7, 3, 2]);
});

test('removeAtIndex removes an array item at a specified index', () => {
  expect.assertions(1);
  expect(removeAtIndex<number>([1, 5, 7, 3, 2], 3)).toStrictEqual([1, 5, 7, 2]);
});

test('average gets the median of a list of data', () => {
  expect.assertions(2);
  expect(average([1, 2, 5, 10, 10, 11, 9, 3, 20], AVERAGE_MEDIAN)).toBe(9);

  expect(average([1, 5, 10, 10, 11, 9, 3, 20], AVERAGE_MEDIAN)).toBe(9.5);
});

test('average gets an exponential average for a list of data', () => {
  expect.assertions(1);
  const theList = [1, 2, 5, 10, 10, 11, 9, 3, 20];

  const averageExp = 13.105675146771038;

  expect(average(theList, AVERAGE_EXP)).toBe(averageExp);
});

test('average gets the mean by default', () => {
  expect.assertions(2);
  expect(average([1, 2, 5, 10, 10, 11, 9, 3, 20])).toBe(71 / 9);

  expect(average([1, 5, 10, 10, 11, 9, 3, 20])).toBe(8.625);
});

test('average does not mutate the array', () => {
  expect.assertions(1);
  const values = [1, 7, 3, 9];

  average(values, AVERAGE_MEDIAN);

  expect(values).toStrictEqual([1, 7, 3, 9]);
});

test('sortByKey sorts an array of objects by multiple keys', () => {
  expect.assertions(1);
  type MyObject = {
    someKey: number;
    otherKey: string;
    dateKey?: Date;
  };

  const valuesUnSorted: MyObject[] = [
    { someKey: 3, otherKey: 'foo', dateKey: new Date('2019-12-19') },
    { someKey: 1, otherKey: 'bar' },
    { someKey: 5.3, otherKey: 'baz' },
    { someKey: 3, otherKey: 'baz', dateKey: new Date('2019-12-03') },
  ];

  expect(sortByKey<MyObject>('someKey', 'dateKey')(valuesUnSorted)).toStrictEqual([
    { someKey: 1, otherKey: 'bar' },
    { someKey: 3, otherKey: 'baz', dateKey: new Date('2019-12-03') },
    { someKey: 3, otherKey: 'foo', dateKey: new Date('2019-12-19') },
    { someKey: 5.3, otherKey: 'baz' },
  ]);
});

test('pad ensures an array is of a fixed length', () => {
  expect.assertions(3);

  expect(pad<number>([1, 2, 3], 2, 0)).toStrictEqual([1, 2]);
  expect(pad<number>([1, 2, 3], 4, 0)).toStrictEqual([1, 2, 3, 0]);
  expect(pad<number>([1, 2, 3], 3, 0)).toStrictEqual([1, 2, 3]);
});
