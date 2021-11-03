import numericHash from 'string-hash';
import { CalculationRows } from '../types';

import { IntermediateTransfersReduction, reduceTransfers } from './transfers';

describe(reduceTransfers.name, () => {
  const now = new Date('2020-07-11');
  const accountId = numericHash('my-account');

  const accountsWithIncome: CalculationRows['accountsWithIncome'] = {
    [numericHash('my-account')]: [],
    [numericHash('other-account')]: [
      {
        id: numericHash('other-account'),
        account: 'Other account',
        net_worth_subcategory_id: 123,
        include_bills: null,
        uid: 1,
        limit_upper: null,
        limit_lower: null,
      },
    ],
  };

  it.each`
    case               | value_year | value_month
    ${'present month'} | ${2020}    | ${6}
    ${'past'}          | ${2019}    | ${1}
  `(
    'should set a transfer from a date in the $case to isVerified=true',
    ({ value_year, value_month }) => {
      expect.assertions(1);
      const result = reduceTransfers(
        {
          accountsWithIncome,
          valueRows: [
            {
              id: numericHash('other-account'),
              value_id: numericHash('value-id-0'),
              value_name: 'Transfer to other account',
              value_year,
              value_month,
              value_value: -6582,
              value_formula: null,
              value_transfer_to: numericHash('my-account'),
            },
          ],
        },
        accountId,
        now,
      );

      expect(result).toStrictEqual<IntermediateTransfersReduction[]>([
        {
          year: value_year,
          month: value_month,
          name: 'Other account transfer',
          value: 6582,
          isVerified: true,
        },
      ]);
    },
  );

  it.each`
    case                             | value_year | value_month
    ${'future (same FY)'}            | ${2020}    | ${7}
    ${'future (next year, same FY)'} | ${2020}    | ${2}
    ${'future (next FY)'}            | ${2021}    | ${3}
  `(
    'should set a transfer from a date in the $case to isVerified=false',
    ({ value_year, value_month }) => {
      expect.assertions(1);
      const result = reduceTransfers(
        {
          accountsWithIncome,
          valueRows: [
            {
              id: numericHash('other-account'),
              value_id: numericHash('value-id-0'),
              value_name: 'Transfer to other account',
              value_year,
              value_month,
              value_value: -6582,
              value_formula: null,
              value_transfer_to: numericHash('my-account'),
            },
          ],
        },
        accountId,
        now,
      );

      expect(result).toStrictEqual<IntermediateTransfersReduction[]>([
        {
          year: value_year,
          month: value_month,
          name: 'Other account transfer',
          value: 6582,
          isVerified: false,
        },
      ]);
    },
  );
});
