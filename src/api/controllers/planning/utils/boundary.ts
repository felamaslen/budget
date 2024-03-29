import {
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  getMonth,
  isAfter,
  startOfMonth,
} from 'date-fns';

import type { CalculationRows } from '../types';
import {
  IntermediatePredictedIncomeReduction,
  IntermediatePreviousIncomeReduction,
} from './income';
import { accountRowHasCreditCardPayment } from './rows';
import { TaxReliefRebateReduction } from './tax';
import { IntermediateTransfersReduction } from './transfers';

import type { PreviousIncomeRow } from '~api/queries';
import {
  evaluatePlanningValue,
  getDateFromYearAndMonth,
  getFinancialYear,
  startMonth,
} from '~shared/planning';

export function getPredictFromDate(
  now: Date,
  { latestActualValues }: Pick<CalculationRows, 'latestActualValues'>,
): Date {
  return startOfMonth(latestActualValues[0] ? addMonths(latestActualValues[0].date, 1) : now);
}

export function getRelevantYears(
  year: number,
  predictFromDate: Date,
  previousIncomeRows: readonly PreviousIncomeRow[],
): number[] {
  const predictionStartYear = getFinancialYear(predictFromDate);
  const previousIncomeOldestYear = previousIncomeRows
    .filter((row) => row.year < year)
    .reduce<number>((min, row) => Math.min(min, row.year), year);

  const startYear = Math.min(predictionStartYear, previousIncomeOldestYear, year);
  const endYear = Math.max(year, predictionStartYear);

  return Array(Math.max(1, endYear - startYear + 1))
    .fill(0)
    .map<number>((_, index) => startYear + index);
}

export function getComputedYearStartAccountValue(
  accountId: number,
  predictFromDate: Date,
  year: number,
  {
    latestActualValues,
    creditCards,
    valueRows,
    billsRows,
  }: Pick<CalculationRows, 'latestActualValues' | 'creditCards' | 'valueRows' | 'billsRows'>,
  previousIncomeReduction: IntermediatePreviousIncomeReduction[],
  predictedIncomeReduction: IntermediatePredictedIncomeReduction[],
  predictedCreditCardPayments: Record<number, number>,
  transfersTo: IntermediateTransfersReduction[],
  taxReliefRebateReduction: TaxReliefRebateReduction[],
): number {
  const latestActualValue = latestActualValues.find((compare) => compare.account_id === accountId);
  if (!latestActualValue) {
    return 0;
  }

  const latestRecordedDate = endOfMonth(latestActualValue.date);

  const endDate = endOfMonth(new Date(year, startMonth));
  const numMonthsToPredict = Math.max(0, differenceInCalendarMonths(endDate, predictFromDate));

  const previousIncomeContribution = previousIncomeReduction
    .filter((group) => group.year < year && isAfter(group.date, latestRecordedDate))
    .reduce<number>(
      (sum0, group) =>
        group.deductions.reduce<number>(
          (sum1, deduction) => sum1 + deduction.value,
          sum0 + group.value,
        ),
      0,
    );

  const predictedIncomeContribution = predictedIncomeReduction
    .filter((group) => group.year < year)
    .reduce<number>(
      (sum0, group) =>
        Object.values(group.deductions).reduce<number>(
          (sum1, deduction) => sum1 - deduction,
          sum0 + group.gross,
        ),
      0,
    );

  const allCreditCardIds = Array.from(new Set(creditCards.map((card) => card.credit_card_id)));
  const creditCardPayments = creditCards.filter(accountRowHasCreditCardPayment);

  const monthsToPredict = Array(numMonthsToPredict)
    .fill(0)
    .map<Date>((_, index) => endOfMonth(addMonths(predictFromDate, index)));

  const creditCardPaymentContribution = monthsToPredict.reduce<number>(
    (sum0, date) =>
      allCreditCardIds.reduce<number>((sum1, cardId) => {
        const recordedPayment = creditCardPayments.find(
          (compare) =>
            compare.credit_card_id === cardId &&
            compare.credit_card_payment_year === getFinancialYear(date) &&
            compare.credit_card_payment_month === getMonth(date),
        );
        if (recordedPayment) {
          return sum1 + recordedPayment.credit_card_payment_value;
        }
        if (!isAfter(predictFromDate, date)) {
          return sum1 + predictedCreditCardPayments[cardId];
        }
        return 0;
      }, sum0),
    0,
  );

  const valueRowsToCount = valueRows.filter(
    (row) =>
      row.id === accountId &&
      row.value_year < year &&
      isAfter(getDateFromYearAndMonth(row.value_year, row.value_month), latestRecordedDate),
  );

  const explicitValuesContribution = valueRowsToCount.reduce<number>(
    (sum, row) => sum + (evaluatePlanningValue(row.value_value, row.value_formula) ?? 0),
    0,
  );

  const billsRowsToCount = billsRows.filter(
    (row) => row.id === accountId && getFinancialYear(row.bills_date) < year,
  );
  const billsContribution = billsRowsToCount.reduce<number>((sum, row) => sum + row.bills_sum, 0);

  const transfersToContribution = transfersTo
    .filter(
      (row) =>
        row.year < year &&
        isAfter(getDateFromYearAndMonth(row.year, row.month), latestRecordedDate),
    )
    .reduce<number>((sum, row) => sum + row.value, 0);

  const taxReliefRebateContribution = taxReliefRebateReduction
    .filter((row) => row.year < year)
    .reduce<number>((sum, row) => sum + row.taxRelief, 0);

  return (
    latestActualValue.value +
    previousIncomeContribution +
    predictedIncomeContribution +
    explicitValuesContribution +
    billsContribution +
    creditCardPaymentContribution +
    transfersToContribution +
    taxReliefRebateContribution
  );
}
