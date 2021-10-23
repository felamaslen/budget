import {
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  formatISO,
  getMonth,
  isAfter,
} from 'date-fns';
import { flatten, groupBy } from 'lodash';

import { replaceAtIndex } from 'replace-array';
import type { CalculationRows } from '../types';
import {
  calculateNIForFutureIncome,
  calculateStudentLoanForFutureIncome,
  calculateTaxForFutureIncome,
} from './calculations';
import { accountRowHasIncome, reduceYearMonthAccumulation } from './rows';
import type {
  AccountRow,
  AccountRowIncomeJoins,
  PreviousIncomeRow,
  PreviousIncomeRowWithDeduction,
} from '~api/queries/planning';
import type { PlanningComputedValue, WithRequiredJoin } from '~api/types';
import {
  ComputedTransactionName,
  getDateFromYearAndMonth,
  getFinancialYear,
  startMonth,
} from '~shared/planning';
import { roundObject } from '~shared/utils';

export const isIncomeRowWithDeduction = (
  row: PreviousIncomeRow,
): row is PreviousIncomeRowWithDeduction => !!row.deduction_name;

export type IntermediatePreviousIncomeReduction = {
  date: Date;
  year: number;
  month: number;
  name: string;
  value: number;
  deductions: { name: string; value: number }[];
};

export function reducePreviousIncomeForAccount(
  previousIncomeRows: CalculationRows['previousIncome'],
  accountName: string,
): IntermediatePreviousIncomeReduction[] {
  const filteredPreviousIncomeRows = previousIncomeRows.filter((row) =>
    row.item.includes(accountName),
  );
  const groupedPreviousIncome = Object.entries(groupBy(filteredPreviousIncomeRows, 'id'));

  const groupedByTransaction = groupedPreviousIncome.map<IntermediatePreviousIncomeReduction>(
    ([, group]) =>
      group.filter(isIncomeRowWithDeduction).reduce<IntermediatePreviousIncomeReduction>(
        (last, row) => ({
          ...last,
          deductions: [
            ...last.deductions,
            { name: row.deduction_name, value: row.deduction_value },
          ],
        }),
        {
          date: endOfMonth(group[0].date),
          year: group[0].year,
          month: group[0].month,
          name: group[0].item,
          value: group[0].gross,
          deductions: [],
        },
      ),
  );

  const groupedByDate = Object.entries(
    groupBy(groupedByTransaction, 'date'),
  ).map<IntermediatePreviousIncomeReduction>(([, group]) => ({
    date: group[0].date,
    year: group[0].year,
    month: group[0].month,
    name: group[0].name,
    value: group.reduce<number>((sum, item) => sum + item.value, 0),
    deductions: group.reduce<IntermediatePreviousIncomeReduction['deductions']>(
      (prev0, nextGroup) =>
        nextGroup.deductions.reduce<IntermediatePreviousIncomeReduction['deductions']>(
          (prev1, nextDeduction) =>
            prev1.some((compare) => compare.name === nextDeduction.name)
              ? replaceAtIndex(
                  prev1,
                  prev1.findIndex((compare) => compare.name === nextDeduction.name),
                  (lastDeduction) => ({
                    ...lastDeduction,
                    value: lastDeduction.value + nextDeduction.value,
                  }),
                )
              : [...prev1, nextDeduction],
          prev0,
        ),
      [],
    ),
  }));

  return groupedByDate;
}

export function getComputedPreviousIncomeForAccount(
  reduction: IntermediatePreviousIncomeReduction[],
  year: number,
): PlanningComputedValue[] {
  return reduction
    .filter((group) => group.year === year)
    .reduce<PlanningComputedValue[]>(
      (last, group) => [
        ...last,
        {
          key: `salary-${formatISO(group.date, { representation: 'date' })}`,
          month: group.month,
          name: 'Salary',
          value: group.value,
          isVerified: true,
          isTransfer: false,
        },
        ...group.deductions.map<PlanningComputedValue>((deduction) => ({
          key: `deduction-${group.year}-${group.month}-${deduction.name}`,
          month: group.month,
          name: deduction.name,
          value: deduction.value,
          isVerified: true,
          isTransfer: false,
        })),
      ],
      [],
    );
}

export type IntermediatePredictedIncomeReduction = {
  date: Date;
  year: number;
  month: number;
  gross: number;
  deductions: {
    pension: number;
    tax: number;
    ni: number;
    studentLoan: number;
  };
};

type IntermediateSingleIncomeReducer = (
  accumulator: IntermediatePredictedIncomeReduction[],
  date: Date,
) => IntermediatePredictedIncomeReduction[];

function reduceSinglePredictedIncomeToMonths(
  calculationRows: Pick<CalculationRows, 'rateRows' | 'thresholdRows' | 'previousIncome'>,
  row: WithRequiredJoin<AccountRow & AccountRowIncomeJoins, AccountRowIncomeJoins>,
): IntermediateSingleIncomeReducer {
  const grossIncome = Math.floor(row.income_salary / 12);
  const pensionContribSalarySacrifice = row.income_pension_contrib * grossIncome;
  const taxableIncome = grossIncome - pensionContribSalarySacrifice;

  return (accumulator, date): IntermediatePredictedIncomeReduction[] => {
    const entryYear = getFinancialYear(date);
    const month = getMonth(date);

    if (
      calculationRows.previousIncome.some(
        (compare) =>
          compare.year === entryYear &&
          compare.month === month &&
          compare.item.includes(row.account),
      )
    ) {
      return accumulator;
    }

    const tax = calculateTaxForFutureIncome(
      calculationRows,
      taxableIncome,
      row.income_tax_code,
      entryYear,
    );

    const ni = calculateNIForFutureIncome(calculationRows, taxableIncome, entryYear);

    const studentLoan = row.income_student_loan
      ? calculateStudentLoanForFutureIncome(calculationRows, taxableIncome, entryYear)
      : 0;

    return reduceYearMonthAccumulation('deductions', accumulator, {
      date: getDateFromYearAndMonth(entryYear, month),
      year: entryYear,
      month,
      gross: grossIncome,
      deductions: roundObject({
        pension: pensionContribSalarySacrifice,
        tax,
        ni,
        studentLoan,
      }),
    });
  };
}

type IntermediateIncomeReducer = (
  accumulator: IntermediatePredictedIncomeReduction[],
  row: WithRequiredJoin<AccountRow & AccountRowIncomeJoins, AccountRowIncomeJoins>,
) => IntermediatePredictedIncomeReduction[];

function reducePredictedIncomeToMonths(
  calculationRows: Pick<CalculationRows, 'rateRows' | 'thresholdRows' | 'previousIncome'>,
  year: number,
  predictFromDate: Date,
): IntermediateIncomeReducer {
  const lastMonthInYear = endOfMonth(getDateFromYearAndMonth(year, ((startMonth - 13) % 12) + 12));

  return (accumulator, row): IntermediatePredictedIncomeReduction[] => {
    const startDateDef = new Date(row.income_start_date);
    const endDateDef = endOfMonth(new Date(row.income_end_date));

    const startDate = endOfMonth(
      isAfter(startDateDef, predictFromDate) ? startDateDef : predictFromDate,
    );
    const endDate = isAfter(endDateDef, lastMonthInYear) ? lastMonthInYear : endOfMonth(endDateDef);

    const incomeDefinitionMonths = Math.max(0, differenceInCalendarMonths(endDate, startDate) + 1);

    return Array(incomeDefinitionMonths)
      .fill(0)
      .map<Date>((_, index) => endOfMonth(addMonths(startDate, index)))
      .reduce(reduceSinglePredictedIncomeToMonths(calculationRows, row), accumulator);
  };
}

export function reducePredictedIncome(
  calculationRows: Pick<CalculationRows, 'rateRows' | 'thresholdRows' | 'previousIncome'>,
  year: number,
  predictFromDate: Date,
  incomeGroup: (AccountRow & AccountRowIncomeJoins)[],
): IntermediatePredictedIncomeReduction[] {
  const rowReducer = reducePredictedIncomeToMonths(calculationRows, year, predictFromDate);

  return incomeGroup.filter(accountRowHasIncome).reduce(rowReducer, []);
}

export function getComputedPredictedIncomeForAccount(
  year: number,
  reduction: IntermediatePredictedIncomeReduction[],
): PlanningComputedValue[] {
  return flatten(
    reduction
      .filter((compare) => compare.year === year)
      .map<PlanningComputedValue[]>((row) => [
        {
          key: `salary-${row.year}-${row.month}-predicted`,
          month: row.month,
          name: ComputedTransactionName.GrossIncome,
          value: row.gross,
          isVerified: false,
          isTransfer: false,
        },
        {
          key: `deduction-${row.year}-${row.month}-Pension-predicted`,
          month: row.month,
          name: ComputedTransactionName.Pension,
          value: -row.deductions.pension,
          isVerified: false,
          isTransfer: false,
        },
        {
          key: `deduction-${row.year}-${row.month}-Tax-predicted`,
          month: row.month,
          name: ComputedTransactionName.IncomeTax,
          value: -row.deductions.tax,
          isVerified: false,
          isTransfer: false,
        },
        {
          key: `deduction-${row.year}-${row.month}-NI-predicted`,
          month: row.month,
          name: ComputedTransactionName.NI,
          value: -row.deductions.ni,
          isVerified: false,
          isTransfer: false,
        },
        {
          key: `deduction-${row.year}-${row.month}-Student loan-predicted`,
          month: row.month,
          name: ComputedTransactionName.StudentLoan,
          value: -row.deductions.studentLoan,
          isVerified: false,
          isTransfer: false,
        },
      ]),
  ).filter(({ value }) => value !== 0);
}
