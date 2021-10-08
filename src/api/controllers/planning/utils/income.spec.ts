import {
  getComputedPreviousIncomeForAccount,
  IntermediatePredictedIncomeReduction,
  IntermediatePreviousIncomeReduction,
  reducePredictedIncome,
  reducePreviousIncomeForAccount,
} from './income';
import { PlanningComputedValue } from '~api/types';

describe(reducePreviousIncomeForAccount.name, () => {
  it('should combine and group recorded income rows by account and month', () => {
    expect.assertions(1);

    expect(
      reducePreviousIncomeForAccount(
        [
          {
            id: 123,
            year: 2020,
            month: 3,
            date: new Date('2020-04-29'),
            item: 'Salary (My account)',
            gross: 400000,
            deduction_name: 'Income tax',
            deduction_value: -63000,
          },
          {
            id: 123,
            year: 2020,
            month: 3,
            date: new Date('2020-04-29'),
            item: 'Salary (My account)',
            gross: 400000,
            deduction_name: 'NI',
            deduction_value: -4700,
          },
          {
            id: 124,
            year: 2020,
            month: 3,
            date: new Date('2020-04-30'),
            item: 'Salary (My account)',
            gross: 280000,
            deduction_name: 'Income tax',
            deduction_value: -2328,
          },
          {
            id: 125,
            year: 2020,
            month: 4,
            date: new Date('2020-05-10'),
            item: 'Salary (My account)',
            gross: 708333,
            deduction_name: 'Income tax',
            deduction_value: -110440,
          },
        ],
        'My account',
      ),
    ).toStrictEqual<IntermediatePreviousIncomeReduction[]>([
      {
        year: 2020,
        month: 3,
        date: new Date('2020-04-30T23:59:59.999Z'),
        name: 'Salary (My account)',
        value: 400000 + 280000,
        deductions: [
          {
            name: 'Income tax',
            value: -(63000 + 2328),
          },
          {
            name: 'NI',
            value: -4700,
          },
        ],
      },
      {
        year: 2020,
        month: 4,
        date: new Date('2020-05-31T23:59:59.999Z'),
        name: 'Salary (My account)',
        value: 708333,
        deductions: [
          {
            name: 'Income tax',
            value: -110440,
          },
        ],
      },
    ]);
  });
});

describe(getComputedPreviousIncomeForAccount.name, () => {
  it('should combine recorded income rows into salary and deduction', () => {
    expect.assertions(1);
    expect(
      getComputedPreviousIncomeForAccount(
        [
          {
            date: new Date('2020-04-20'),
            year: 2020,
            month: 3,
            name: 'Some salary innit',
            value: 550000,
            deductions: [
              {
                name: 'Income tax',
                value: -110239,
              },
              {
                name: 'NI',
                value: -39639,
              },
            ],
          },
        ],
        2020,
      ),
    ).toStrictEqual<PlanningComputedValue[]>([
      {
        key: 'salary-2020-04-20',
        month: 3,
        name: 'Salary',
        value: 550000,
        isVerified: true,
        isTransfer: false,
      },
      {
        key: 'deduction-2020-3-Income tax',
        month: 3,
        name: 'Income tax',
        value: -110239,
        isVerified: true,
        isTransfer: false,
      },
      {
        key: 'deduction-2020-3-NI',
        month: 3,
        name: 'NI',
        value: -39639,
        isVerified: true,
        isTransfer: false,
      },
    ]);
  });
});

describe(reducePredictedIncome, () => {
  const args: Parameters<typeof reducePredictedIncome> = [
    {
      rateRows: [
        { id: 1, uid: 1, year: 2022, name: 'IncomeTaxBasicRate', value: 0.2 },
        { id: 2, uid: 1, year: 2022, name: 'IncomeTaxHigherRate', value: 0.4 },
        { id: 3, uid: 1, year: 2022, name: 'IncomeTaxAdditionalRate', value: 0.45 },
        { id: 4, uid: 1, year: 2022, name: 'NILowerRate', value: 0.12 },
        { id: 5, uid: 1, year: 2022, name: 'NIHigherRate', value: 0.02 },
      ],
      thresholdRows: [
        { id: 1, uid: 1, year: 2022, name: 'IncomeTaxBasicThreshold', value: 3750000 },
        { id: 2, uid: 1, year: 2022, name: 'IncomeTaxAdditionalThreshold', value: 15000000 },
        { id: 3, uid: 1, year: 2022, name: 'NIPT', value: 79700 },
        { id: 4, uid: 1, year: 2022, name: 'NIUEL', value: 418900 },
      ],
      previousIncome: [],
    },
    2022,
    new Date('2021-09-18'),
    [
      {
        id: 123,
        uid: 1,
        account: 'My account',
        net_worth_subcategory_id: 184,
        limit_lower: null,
        limit_upper: null,
        income_id: 100,
        income_salary: 3700000,
        income_start_date: new Date('2022-03-19'),
        income_end_date: new Date('2023-05-10'),
        income_tax_code: '1257L',
        income_student_loan: false,
        income_pension_contrib: 0.05,
      },
    ],
  ];

  it('should compute dated salary entries with deductions', () => {
    expect.assertions(1);
    expect(reducePredictedIncome(...args)).toStrictEqual(
      expect.arrayContaining<IntermediatePredictedIncomeReduction>([
        {
          date: new Date('2022-04-30T23:59:59.999Z'),
          year: 2022,
          month: 3,
          gross: 308333,
          deductions: expect.objectContaining<IntermediatePredictedIncomeReduction['deductions']>({
            tax: expect.any(Number),
            ni: expect.any(Number),
            pension: expect.any(Number),
            studentLoan: expect.any(Number),
          }),
        },
      ]),
    );
  });

  it('should round off deductions', () => {
    expect.assertions(2);
    const result = reducePredictedIncome(...args);
    expect(result[0].deductions.pension).toBeCloseTo(15417, 0);
    expect(Math.round(result[0].deductions.pension)).toStrictEqual(result[0].deductions.pension);
  });
});
