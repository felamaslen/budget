import { evaluatePlanningValue, getDateFromYearAndMonth, getFinancialYear } from './planning';

describe(evaluatePlanningValue.name, () => {
  it('should evaluate a formula, converting from pounds to pence', () => {
    expect.assertions(1);
    expect(evaluatePlanningValue(null, '14*3.05')).toBe(4270);
  });

  it('should return a value', () => {
    expect.assertions(1);
    expect(evaluatePlanningValue(9703, null)).toBe(9703);
  });
});

describe(getFinancialYear.name, () => {
  describe('when the date is before the end of the financial year', () => {
    it('should return the previous year', () => {
      expect.assertions(3);
      expect(getFinancialYear(new Date('2021-01-01'))).toBe(2020);
      expect(getFinancialYear(new Date('2021-03-20'))).toBe(2020);
      expect(getFinancialYear(new Date('2021-03-31'))).toBe(2020);
    });
  });

  describe('when the date is after the end of the financial year', () => {
    it('should return the current year', () => {
      expect.assertions(3);
      expect(getFinancialYear(new Date('2021-04-01'))).toBe(2021);
      expect(getFinancialYear(new Date('2021-04-19'))).toBe(2021);
      expect(getFinancialYear(new Date('2021-12-31'))).toBe(2021);
    });
  });
});

describe(getDateFromYearAndMonth.name, () => {
  it.each`
    year    | month | date
    ${2020} | ${3}  | ${'2020-04-30T23:59:59.999Z'}
    ${2020} | ${4}  | ${'2020-05-31T23:59:59.999Z'}
    ${2020} | ${5}  | ${'2020-06-30T23:59:59.999Z'}
    ${2020} | ${6}  | ${'2020-07-31T23:59:59.999Z'}
    ${2020} | ${7}  | ${'2020-08-31T23:59:59.999Z'}
    ${2020} | ${8}  | ${'2020-09-30T23:59:59.999Z'}
    ${2020} | ${9}  | ${'2020-10-31T23:59:59.999Z'}
    ${2020} | ${10} | ${'2020-11-30T23:59:59.999Z'}
    ${2020} | ${11} | ${'2020-12-31T23:59:59.999Z'}
    ${2020} | ${0}  | ${'2021-01-31T23:59:59.999Z'}
    ${2020} | ${1}  | ${'2021-02-28T23:59:59.999Z'}
    ${2020} | ${2}  | ${'2021-03-31T23:59:59.999Z'}
  `('should return $date from year=$year and month=$month', ({ year, month, date }) => {
    expect.assertions(1);
    expect(getDateFromYearAndMonth(year, month)).toStrictEqual(new Date(date));
  });
});
