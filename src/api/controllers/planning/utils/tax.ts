import { addYears, differenceInCalendarMonths, endOfMonth, isAfter, startOfMonth } from 'date-fns';
import { groupBy } from 'lodash';

import { CalculationRows } from '../types';
import { calculateYearlyTaxRelief } from './calculations';
import { accountRowHasIncome, accountRowHasValue } from './rows';

import type {
  AccountRow,
  AccountRowIncomeJoins,
  PreviousIncomeRow,
  RateRow,
  selectPlanningAccountsWithIncome,
  selectPlanningAccountsWithValues,
  ThresholdRow,
} from '~api/queries/planning';
import type { AsyncReturnType, PlanningComputedValue, WithRequiredJoin } from '~api/types';
import {
  evaluatePlanningValue,
  getFinancialYear,
  getIncomeRatesForYear,
  IncomeRates,
  startMonth,
} from '~shared/planning';

const isTaxDeductible = (row: { value_name: string }): boolean => /^Pension/.test(row.value_name);

function computeTaxReliefForAccount(
  previousYear: number,
  rates: IncomeRates,
  accountRowsWithValues: AsyncReturnType<typeof selectPlanningAccountsWithValues>,
  previousIncomeRows: readonly PreviousIncomeRow[],
  accountGroup: WithRequiredJoin<AccountRow & AccountRowIncomeJoins, AccountRowIncomeJoins>[],
): ReturnType<typeof calculateYearlyTaxRelief> {
  if (!accountGroup.length) {
    return { basic: 0, extra: 0 };
  }

  const previousYearStartDate = startOfMonth(new Date(previousYear, startMonth));
  const previousYearEndDate = endOfMonth(addYears(previousYearStartDate, 1));

  const manualDeductionRows = accountRowsWithValues
    .filter(accountRowHasValue)
    .filter((row) => row.value_year === previousYear)
    .filter(isTaxDeductible);

  const recordedIncomeInYear = previousIncomeRows.filter(
    (row) => getFinancialYear(row.date) === previousYear,
  );

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

    if (isAfter(previousYearStartDate, endDateDef) || isAfter(startDateDef, previousYearEndDate)) {
      return incomePredictedSum;
    }

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

  return taxReliefFromThisAccount;
}

export type TaxReliefRebateReduction = {
  year: number;
  taxRelief: number;
};

export function reduceTaxReliefRebate(
  { valueRows, previousIncome, rateRows, thresholdRows }: CalculationRows,
  viewedYear: number,
  predictFromDate: Date,
  incomeGroup: (AccountRow & AccountRowIncomeJoins)[],
): TaxReliefRebateReduction[] {
  const firstYear = getFinancialYear(predictFromDate);
  const numYears = viewedYear - firstYear + 1;
  if (numYears <= 0) {
    return [];
  }
  return Array(numYears)
    .fill(0)
    .map<TaxReliefRebateReduction>((_, index) => {
      const previousYear = firstYear + index - 1;
      const rates = getIncomeRatesForYear({
        rates: rateRows.filter((row) => row.year === previousYear),
        thresholds: thresholdRows.filter((row) => row.year === previousYear),
      });
      const { extra } = computeTaxReliefForAccount(
        previousYear,
        rates,
        valueRows,
        previousIncome,
        incomeGroup.filter(accountRowHasIncome),
      );
      return { year: firstYear + index, taxRelief: extra };
    });
}

export function getComputedTaxReliefRebateForAccount(
  year: number,
  taxReliefRebateReduction: TaxReliefRebateReduction[],
  accountId: number,
): PlanningComputedValue[] {
  const rebateInYear = taxReliefRebateReduction.find((compare) => compare.year === year);
  if (!rebateInYear) {
    return [];
  }

  return [
    {
      key: `tax-relief-${year}-${startMonth}-${accountId}`,
      month: startMonth,
      name: 'Tax relief',
      value: rebateInYear.taxRelief,
      isTransfer: false,
      isVerified: false,
    },
  ];
}

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
  const incomeGroupedByAccount = groupBy(accountRowsWithIncome.filter(accountRowHasIncome), 'id');

  return Object.values(incomeGroupedByAccount).reduce<number>((sum, accountGroup) => {
    const { basic, extra } = computeTaxReliefForAccount(
      previousYear,
      rates,
      accountRowsWithValues,
      previousIncomeRows,
      accountGroup,
    );
    return sum + basic + extra;
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
