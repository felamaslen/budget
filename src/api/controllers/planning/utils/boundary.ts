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
import { IntermediateTransfersReduction } from './transfers';

import type { PreviousIncomeRow } from '~api/queries/planning';
import {
  evaluatePlanningValue,
  getDateFromYearAndMonth,
  getFinancialYear,
  startMonth,
} from '~shared/planning';

export function getRelevantYears(
  year: number,
  previousIncomeRows: readonly PreviousIncomeRow[],
): number[] {
  const startYear = previousIncomeRows
    .filter((row) => row.year < year)
    .reduce<number>((min, row) => Math.min(min, row.year), year);

  return Array(year - startYear + 1)
    .fill(0)
    .map<number>((_, index) => startYear + index);
}

export function getComputedYearStartAccountValue(
  accountId: number,
  now: Date,
  year: number,
  {
    latestActualValues,
    creditCardPayments,
    valueRows,
  }: Pick<CalculationRows, 'latestActualValues' | 'creditCardPayments' | 'valueRows'>,
  previousIncomeReduction: IntermediatePreviousIncomeReduction[],
  predictedIncomeReduction: IntermediatePredictedIncomeReduction[],
  predictedCreditCardPayments: Record<number, number>,
  transfersTo: IntermediateTransfersReduction[],
): number {
  const latestActualValue = latestActualValues.find((compare) => compare.account_id === accountId);
  if (!latestActualValue) {
    return 0;
  }

  const latestRecordedDate = endOfMonth(latestActualValue.date);

  const endDate = endOfMonth(new Date(year, startMonth));
  const numMonthsToPredict = Math.max(0, differenceInCalendarMonths(endDate, latestRecordedDate));

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

  const allCreditCardIds = creditCardPayments.map((card) => card.credit_card_id);

  const monthsToPredict = Array(numMonthsToPredict)
    .fill(0)
    .map<Date>((_, index) => endOfMonth(addMonths(latestActualValue.date, index)));

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
        if (isAfter(date, startOfMonth(now))) {
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

  const transfersToContribution = transfersTo
    .filter(
      (row) =>
        row.year < year &&
        isAfter(getDateFromYearAndMonth(row.year, row.month), latestRecordedDate),
    )
    .reduce<number>((sum, row) => sum + row.value, 0);

  return (
    latestActualValue.value +
    previousIncomeContribution +
    predictedIncomeContribution +
    explicitValuesContribution +
    creditCardPaymentContribution +
    transfersToContribution
  );
}
