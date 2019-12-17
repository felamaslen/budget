import { getMonthDatesList } from '~/modules/date';

test('getMonthDatesList gets a list of dates at the end of each month', () => {
  expect.assertions(1);
  const startDate = new Date('2018-01-01Z');
  const endDate = new Date('2018-07-01Z');

  expect(getMonthDatesList(startDate, endDate)).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
    new Date('2018-02-28T23:59:59.999Z'),
    new Date('2018-03-31T23:59:59.999Z'),
    new Date('2018-04-30T23:59:59.999Z'),
    new Date('2018-05-31T23:59:59.999Z'),
    new Date('2018-06-30T23:59:59.999Z'),
    new Date('2018-07-31T23:59:59.999Z'),
  ]);
});

test('getMonthDatesList returns lists of one month', () => {
  expect.assertions(1);
  const startDate = new Date('2018-01-01Z');
  const endDate = new Date('2018-01-01Z');

  expect(getMonthDatesList(startDate, endDate)).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
  ]);
});

test('getMonthDatesList returns an empty array if the start month is after the end month', () => {
  expect.assertions(2);
  expect(getMonthDatesList(new Date('2018-01-03Z'), new Date('2017-12-29Z'))).toStrictEqual([]);
  expect(getMonthDatesList(new Date('2018-01-03Z'), new Date('2017-11-14Z'))).toStrictEqual([]);
});
