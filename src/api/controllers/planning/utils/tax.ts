import { addYears, differenceInCalendarMonths, endOfMonth, isAfter, startOfMonth } from 'date-fns';
import { groupBy } from 'lodash';

import { calculateYearlyTaxRelief } from './calculations';
import { accountRowHasIncome, accountRowHasValue } from './rows';

import type {
  PreviousIncomeRow,
  RateRow,
  selectPlanningAccountsWithIncome,
  selectPlanningAccountsWithValues,
  ThresholdRow,
} from '~api/queries/planning';
import type { AsyncReturnType } from '~api/types';
import {
  evaluatePlanningValue,
  getFinancialYear,
  getIncomeRatesForYear,
  IncomeRates,
  startMonth,
} from '~shared/planning';

const isTaxDeductible = (row: { value_name: string }): boolean => /^Pension/.test(row.value_name);

export function computeTaxReliefFromPreviousYearIncome({
  accountRowsWithIncome,
  accountRowsWithValues,
  previousIncomeRows,
  rates,
  previousYear,
}: {
  accountRowsWithIncome: AsyncReturnType<typeof selectPlanningAccountsWithIncome>;
  accountRowsWithValues: AsyncReturnType<typeof selectPlanningAccountsWithValues>;
  previousIncomeRows: readonly PreviousIncomeRow[];
  rates: IncomeRates;
  previousYear: number;
}): number {
  const previousYearStartDate = startOfMonth(new Date(previousYear, startMonth));
  const previousYearEndDate = endOfMonth(addYears(previousYearStartDate, 1));
  const manualDeductionRows = accountRowsWithValues
    .filter(accountRowHasValue)
    .filter((row) => row.value_year === previousYear)
    .filter(isTaxDeductible);

  const incomeGroupedByAccount = groupBy(
    accountRowsWithIncome.filter(accountRowHasIncome).filter((row) => {
      const startDateDef = new Date(row.income_start_date);
      const endDateDef = new Date(row.income_end_date);

      return (
        !isAfter(previousYearStartDate, endDateDef) && !isAfter(startDateDef, previousYearEndDate)
      );
    }),
    'id',
  );

  const recordedIncomeInYear = previousIncomeRows.filter(
    (row) => getFinancialYear(row.date) === previousYear,
  );

  return Object.values(incomeGroupedByAccount).reduce<number>((sum, accountGroup) => {
    const finalTaxCode = accountGroup
      .map((row) => ({ taxCode: row.income_tax_code, date: new Date(row.income_end_date) }))
      .sort((a, b) => (isAfter(a.date, b.date) ? -1 : 1))[0].taxCode;

    const previousIncomeRowsFiltered = Object.values(
      groupBy(
        recordedIncomeInYear.filter((row) =>
          row.item.toLowerCase().includes(accountGroup[0].account.toLowerCase()),
        ),
        'id',
      ),
    );

    const taxableIncomeRecorded = previousIncomeRowsFiltered.reduce<number>(
      (previousIncomeSum, group) =>
        group
          .filter(({ deduction_name }) => deduction_name && /SalSac/.test(deduction_name))
          .reduce<number>(
            (groupSum, { deduction_value }) => groupSum + (deduction_value ?? 0),
            previousIncomeSum + group[0].gross,
          ),
      0,
    );

    const taxableIncomePredicted = accountGroup.reduce<number>((incomePredictedSum, row) => {
      const startDateDef = new Date(row.income_start_date);
      const endDateDef = new Date(row.income_end_date);

      const startDate = endOfMonth(
        isAfter(startDateDef, previousYearStartDate) ? startDateDef : previousYearStartDate,
      );
      const endDate = endOfMonth(
        isAfter(endDateDef, previousYearEndDate) ? previousYearEndDate : endDateDef,
      );

      const numMonths =
        differenceInCalendarMonths(endDate, startDate) -
        previousIncomeRowsFiltered.filter(
          (group) => !isAfter(group[0].date, endDate) && !isAfter(startDate, group[0].date),
        ).length;

      return (
        incomePredictedSum + (row.income_salary * (1 - row.income_pension_contrib) * numMonths) / 12
      );
    }, 0);

    const taxableIncome = taxableIncomeRecorded + taxableIncomePredicted;

    const manualDeductions = manualDeductionRows
      .filter((row) => row.id === accountGroup[0].id)
      .reduce<number>(
        (sumDeductions, deductionRow) =>
          sumDeductions -
          (evaluatePlanningValue(deductionRow.value_value, deductionRow.value_formula) ?? 0),
        0,
      );

    const taxReliefFromThisAccount = calculateYearlyTaxRelief(
      taxableIncome,
      finalTaxCode,
      manualDeductions,
      rates.taxBasicAllowance,
      rates.taxAdditionalThreshold,
      rates.taxBasicRate,
      rates.taxHigherRate,
      rates.taxAdditionalRate,
    );

    return sum + taxReliefFromThisAccount;
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

  const taxRelief = computeTaxReliefFromPreviousYearIncome({
    accountRowsWithIncome,
    accountRowsWithValues,
    previousIncomeRows,
    rates,
    previousYear,
  });

  return Math.round(taxRelief);
}
