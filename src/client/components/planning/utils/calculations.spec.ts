import { getSequentialMonth } from './calculations';

describe(getSequentialMonth.name, () => {
  it.each`
    month | sequentialMonth
    ${3}  | ${3}
    ${4}  | ${4}
    ${5}  | ${5}
    ${6}  | ${6}
    ${7}  | ${7}
    ${8}  | ${8}
    ${9}  | ${9}
    ${10} | ${10}
    ${11} | ${11}
    ${0}  | ${12}
    ${1}  | ${13}
    ${2}  | ${14}
  `('should return $sequentialMonth from $month', ({ sequentialMonth, month }) => {
    expect.assertions(1);
    expect(getSequentialMonth(month)).toBe(sequentialMonth);
  });
});
