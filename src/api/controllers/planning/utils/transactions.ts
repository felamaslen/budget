import { addMonths, isAfter, startOfMonth } from 'date-fns';

import type { CalculationRows } from '../types';

import { getComputedBillsValuesForAccount, reduceBillsForAccount } from './bills';
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
  const predictFromDate = startOfMonth(
    calculationRows.latestActualValues[0] &&
      !isAfter(startOfMonth(now), calculationRows.latestActualValues[0]?.date)
      ? addMonths(calculationRows.latestActualValues[0].date, 1)
      : now,
  );

  const { id: accountId, account } = incomeGroup[0];
  const previousIncomeReduction = reducePreviousIncomeForAccount(
    calculationRows.previousIncome,
    account,
  );

  const previousIncome = getComputedPreviousIncomeForAccount(previousIncomeReduction, year);

  const predictedIncomeReduction = reducePredictedIncome(
    calculationRows,
    year,
    predictFromDate,
    incomeGroup,
  );
  const predictedIncome = getComputedPredictedIncomeForAccount(year, predictedIncomeReduction);

  const transfersReduction = reduceTransfers(calculationRows, accountId, now);
  const transfersValues = getComputedTransferValuesForAccount(year, transfersReduction);

  const billsReduction = reduceBillsForAccount(incomeGroup[0].id, calculationRows);
  const billsValues = getComputedBillsValuesForAccount(year, now, billsReduction);

  const computedValues: PlanningComputedValue[] = [
    ...previousIncome,
    ...predictedIncome,
    ...billsValues,
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
      predictFromDate,
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
