import numericHash from 'string-hash';

import { computeTaxReliefFromPreviousYearIncome } from './tax';
import { IncomeRates } from '~shared/planning';

describe(computeTaxReliefFromPreviousYearIncome.name, () => {
  const rates: IncomeRates = {
    taxBasicRate: 0.2,
    taxHigherRate: 0.4,
    taxAdditionalRate: 0.45,
    taxBasicAllowance: 3750000,
    taxAdditionalThreshold: 15000000,
    niLowerRate: 0.12,
    niHigherRate: 0.02,
    niPaymentThreshold: 79700,
    niUpperEarningsLimit: 418900,
    studentLoanRate: 0.09,
    studentLoanThreshold: 2729500,
  };

  const previousYear = 2021;

  const manualPensionContributions = 350000;

  it('should offset manual pension contributions against predicted income', () => {
    expect.assertions(1);

    const result = computeTaxReliefFromPreviousYearIncome({
      accountRowsWithIncome: [
        {
          uid: 1,
          id: numericHash('my-account'),
          account: 'My account',
          net_worth_subcategory_id: numericHash('my-bank'),
          limit_lower: null,
          limit_upper: null,
          include_bills: null,
          income_id: numericHash('my-income-a'),
          income_salary: 8500000,
          income_start_date: '2021-07-05',
          income_end_date: '2022-04-10',
          income_tax_code: '1257L',
          income_student_loan: null,
          income_pension_contrib: null,
        },
      ],
      accountRowsWithValues: [
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
      previousIncomeRows: [],
      rates,
      previousYear,
    });

    expect(result).toBe(manualPensionContributions * 0.4);
  });

  it('should offset manual pension contributions against previous (recorded) income', () => {
    expect.assertions(1);

    const result = computeTaxReliefFromPreviousYearIncome({
      accountRowsWithIncome: [
        {
          uid: 1,
          id: numericHash('my-account'),
          account: 'My account',
          net_worth_subcategory_id: numericHash('my-bank'),
          limit_lower: null,
          limit_upper: null,
          include_bills: null,
          income_id: numericHash('my-income-a'),
          income_salary: 3750000 + 1257000,
          income_start_date: '2021-01-05',
          income_end_date: '2022-04-10',
          income_tax_code: '1257L',
          income_student_loan: null,
          income_pension_contrib: null,
        },
      ],
      accountRowsWithValues: [
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
      previousIncomeRows: [
        {
          id: numericHash('my-income'),
          date: new Date('2021-05-15'),
          year: 2021,
          month: 4,
          item: 'Salary (my account)',
          gross: 417250,
          deduction_name: null,
          deduction_value: null,
        },
      ],
      rates,
      previousYear,
    });

    expect(result).toBe(manualPensionContributions * 0.2);
  });
});
