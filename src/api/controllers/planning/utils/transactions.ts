import type { CalculationRows } from '../types';

import { getComputedYearStartAccountValue } from './boundary';
import { getComputedCreditCardPayments } from './credit';
import {
  getComputedPredictedIncomeForAccount,
  getComputedPreviousIncomeForAccount,
  reducePredictedIncome,
  reducePreviousIncomeForAccount,
} from './income';
import { getComputedTransferValuesForAccount, reduceTransfers } from './transfers';

import type { AccountRow, AccountRowIncomeJoins } from '~api/queries/planning';
import type { PlanningComputedValue } from '~api/types';

export function getComputedTransactionsForAccount(
  calculationRows: CalculationRows,
  year: number,
  now: Date,
  incomeGroup: (AccountRow & AccountRowIncomeJoins)[],
): {
  computedStartValue: number;
  computedValues: PlanningComputedValue[];
  predictedCreditCardPayments: Record<number, number>;
} {
  const { id: accountId, account } = incomeGroup[0];
  const previousIncomeReduction = reducePreviousIncomeForAccount(
    calculationRows.previousIncome,
    account,
  );

  const previousIncome = getComputedPreviousIncomeForAccount(previousIncomeReduction, year);

  const predictedIncomeReduction = reducePredictedIncome(calculationRows, year, now, incomeGroup);

  const predictedIncome = getComputedPredictedIncomeForAccount(year, predictedIncomeReduction);

  const transfersReduction = reduceTransfers(calculationRows, accountId, now);
  const transfersValues = getComputedTransferValuesForAccount(year, transfersReduction);

  const computedValues: PlanningComputedValue[] = [
    ...previousIncome,
    ...predictedIncome,
    ...transfersValues,
  ].map((row) => ({
    ...row,
    value: Math.round(row.value),
  }));

  const predictedCreditCardPayments = getComputedCreditCardPayments(
    calculationRows.averageCreditCardPaymentRows,
  );

  const computedStartValue = Math.round(
    getComputedYearStartAccountValue(
      accountId,
      now,
      year,
      calculationRows,
      previousIncomeReduction,
      predictedIncomeReduction,
      predictedCreditCardPayments,
      transfersReduction,
    ),
  );

  return {
    computedStartValue,
    computedValues,
    predictedCreditCardPayments,
  };
}
