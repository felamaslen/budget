import numericHash from 'string-hash';

import { CalculationRows } from '../types';
import * as stubs from './__tests__/stubs';
import { getComputedTransactionsForAccount } from './transactions';

import { AccountRow, AccountRowIncomeJoins } from '~api/queries';
import { PlanningComputedValue } from '~api/types';

describe(getComputedTransactionsForAccount.name, () => {
  const manualPensionContributions = 350000;

  const calculationRows: CalculationRows = {
    accountsWithIncome: {
      [numericHash('my-account')]: [
        {
          id: numericHash('my-account'),
          uid: 1,
          account: 'My account',
          net_worth_subcategory_id: numericHash('my-bank'),
          limit_lower: null,
          limit_upper: null,
          include_bills: null,
        },
      ],
    },
    thresholdRows: [...stubs.thresholdRows(2021), ...stubs.thresholdRows(2022)],
    rateRows: [...stubs.rateRows(2021), ...stubs.rateRows(2022)],
    valueRows: [
      {
        id: numericHash('my-account'),
        value_id: numericHash('my-pension-contribution'),
        value_name: 'Pension (SIPP)',
        value_year: 2021,
        value_month: 1, // Feb-22
        value_value: -manualPensionContributions,
        value_formula: null,
        value_transfer_to: null,
      },
    ],
    billsRows: [],
    latestActualValues: [],
    previousIncome: [],
    creditCards: [],
    averageCreditCardPaymentRows: [],
  };

  const year = 2022;
  const now = new Date('2021-06-19');
  const predictFromDate = new Date('2021-07-01');

  const incomeGroup: (AccountRow & AccountRowIncomeJoins)[] = [
    {
      ...calculationRows.accountsWithIncome[numericHash('my-account')][0],
      income_id: numericHash('my-income-a'),
      income_salary: 8500000,
      income_start_date: '2021-07-05',
      income_end_date: '2022-04-10',
      income_tax_code: '1257L',
      income_student_loan: null,
      income_pension_contrib: null,
    },
  ];

  it('should include a transaction for the extra tax relief rebate', () => {
    expect.assertions(1);
    const { computedValues } = getComputedTransactionsForAccount(
      calculationRows,
      year,
      now,
      predictFromDate,
      incomeGroup,
    );
    expect(computedValues).toStrictEqual(
      expect.arrayContaining<PlanningComputedValue>([
        {
          key: `tax-relief-2022-3-${numericHash('my-account')}`,
          month: 3,
          name: 'Tax relief',
          value: manualPensionContributions * 0.2,
          isTransfer: false,
          isVerified: false,
        },
      ]),
    );
  });

  it('should not compute tax relief rebates for months in the past', () => {
    expect.assertions(1);
    const { computedValues } = getComputedTransactionsForAccount(
      calculationRows,
      year,
      new Date('2022-05-03'),
      predictFromDate,
      incomeGroup,
    );
    expect(computedValues).not.toStrictEqual(
      expect.arrayContaining<PlanningComputedValue>([
        expect.objectContaining({
          name: 'Tax relief',
        }),
      ]),
    );
  });

  it('should include tax relief rebates in the computed start value calculation', () => {
    expect.assertions(1);
    const { computedStartValue } = getComputedTransactionsForAccount(
      {
        ...calculationRows,
        latestActualValues: [
          { account_id: numericHash('my-account'), date: new Date('2021-07-31'), value: 0 },
        ],
      },
      year + 1,
      now,
      predictFromDate,
      incomeGroup,
    );

    const expectedIncome = 4204070;
    const expectedTaxReliefRebateInPreviousYear = manualPensionContributions * 0.2;

    expect(computedStartValue).toBe(
      expectedIncome - manualPensionContributions + expectedTaxReliefRebateInPreviousYear,
    );
  });
});
