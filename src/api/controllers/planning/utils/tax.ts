import {
  addYears,
  differenceInCalendarMonths,
  endOfMonth,
  getMonth,
  isAfter,
  startOfMonth,
} from 'date-fns';
import { groupBy } from 'lodash';

import { calculateMonthlyTaxRelief } from './calculations';
import { isIncomeRowWithDeduction } from './income';
import { accountRowHasIncome, accountRowHasValue } from './rows';

import type {
  PreviousIncomeRow,
  PreviousIncomeRowWithDeduction,
  RateRow,
  selectPlanningAccountsWithIncome,
  selectPlanningAccountsWithValues,
  ThresholdRow,
} from '~api/queries/planning';
import type { AsyncReturnType } from '~api/types';
import {
  evaluatePlanningValue,
  getIncomeRatesForYear,
  IncomeRates,
  startMonth,
} from '~shared/planning';

const isTaxDeductible = (row: { value_name: string }): boolean => /^Pension/.test(row.value_name);

const isSalarySacrifice = (row: PreviousIncomeRowWithDeduction): boolean =>
  row.deduction_name === 'Pension' || /\(SalSac\)/.test(row.deduction_name);

function computeTaxReliefFromPredictedIncome(
  accountRowsWithIncome: AsyncReturnType<typeof selectPlanningAccountsWithIncome>,
  accountRowsWithValues: AsyncReturnType<typeof selectPlanningAccountsWithValues>,
  rates: IncomeRates,
  previousYear: number,
): number {
  const previousYearStartDate = startOfMonth(new Date(previousYear, startMonth));
  const previousYearEndDate = endOfMonth(addYears(previousYearStartDate, 1));
  const manualDeductionRows = accountRowsWithValues
    .filter(accountRowHasValue)
    .filter((row) => row.value_year === previousYear)
    .filter(isTaxDeductible);

  return accountRowsWithIncome.filter(accountRowHasIncome).reduce<number>((sum0, row) => {
    const startDateDef = new Date(row.income_start_date);
    const endDateDef = new Date(row.income_end_date);

    if (isAfter(previousYearStartDate, endDateDef) || isAfter(startDateDef, previousYearEndDate)) {
      return sum0;
    }

    const startDate = endOfMonth(
      isAfter(startDateDef, previousYearStartDate) ? startDateDef : previousYearStartDate,
    );
    const endDate = endOfMonth(
      isAfter(endDateDef, previousYearEndDate) ? previousYearEndDate : endDateDef,
    );

    const numMonths = differenceInCalendarMonths(endDate, startDate);

    const startDateMonth = getMonth(startDate);

    return Array(numMonths)
      .fill(0)
      .reduce<number>((sum1, _, index) => {
        const manualDeductions = manualDeductionRows
          .filter((deductionRow) => deductionRow.value_month === startDateMonth + index)
          .reduce<number>(
            (sumDeductions, deductionRow) =>
              sumDeductions -
              (evaluatePlanningValue(deductionRow.value_value, deductionRow.value_formula) ?? 0),
            0,
          );

        const taxReliefFromThisIncome = calculateMonthlyTaxRelief(
          (row.income_salary * (1 - row.income_pension_contrib)) / 12,
          row.income_tax_code,
          manualDeductions,
          rates.taxBasicAllowance,
          rates.taxAdditionalThreshold,
          rates.taxBasicRate,
          rates.taxHigherRate,
          rates.taxAdditionalRate,
        );

        return sum1 + taxReliefFromThisIncome;
      }, sum0);
  }, 0);
}

function computeTaxReliefFromPreviousIncome(
  accountRowsWithIncome: AsyncReturnType<typeof selectPlanningAccountsWithIncome>,
  previousIncomeRows: readonly PreviousIncomeRow[],
  rates: IncomeRates,
  previousYear: number,
): number {
  return Object.entries(
    groupBy(
      previousIncomeRows.filter((row) => row.year === previousYear),
      'id',
    ),
  ).reduce<number>((sumTaxRelief, [, group]) => {
    const taxCode = accountRowsWithIncome
      .filter(accountRowHasIncome)
      .find(
        (compare) =>
          !isAfter(new Date(compare.income_start_date), group[0].date) &&
          !isAfter(group[0].date, new Date(compare.income_end_date)),
      )?.income_tax_code;

    if (!taxCode) {
      return sumTaxRelief;
    }

    const deductions = group
      .filter(isIncomeRowWithDeduction)
      .filter(isSalarySacrifice)
      .reduce<number>((sumDeductions, row) => sumDeductions - row.deduction_value, 0);

    const taxReliefFromThisIncome = calculateMonthlyTaxRelief(
      group[0].gross,
      taxCode,
      deductions,
      rates.taxBasicAllowance,
      rates.taxAdditionalThreshold,
      rates.taxBasicRate,
      rates.taxHigherRate,
      rates.taxAdditionalRate,
    );

    return sumTaxRelief + taxReliefFromThisIncome;
  }, 0);
}

export function computeTaxReliefFromPreviousYear(
  currentYear: number,
  thresholdRows: readonly ThresholdRow[],
  rateRows: readonly RateRow[],
  accountRowsWithIncome: AsyncReturnType<typeof selectPlanningAccountsWithIncome>,
  accountRowsWithValues: AsyncReturnType<typeof selectPlanningAccountsWithValues>,
  previousIncomeRows: readonly PreviousIncomeRow[],
): number {
  const previousYear = currentYear - 1;

  const rates = getIncomeRatesForYear({
    rates: rateRows.filter((row) => row.year === previousYear),
    thresholds: thresholdRows.filter((row) => row.year === previousYear),
  });

  const taxReliefFromPredictedIncome = computeTaxReliefFromPredictedIncome(
    accountRowsWithIncome,
    accountRowsWithValues,
    rates,
    previousYear,
  );

  const taxReliefFromPreviousIncome = computeTaxReliefFromPreviousIncome(
    accountRowsWithIncome,
    previousIncomeRows,
    rates,
    previousYear,
  );

  return taxReliefFromPredictedIncome + taxReliefFromPreviousIncome;
}
