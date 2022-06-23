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
import { getComputedTaxReliefRebateForAccount, reduceTaxReliefRebate } from './tax';
import { getComputedTransferValuesForAccount, reduceTransfers } from './transfers';

import type { AccountRow, AccountRowIncomeJoins } from '~api/queries/planning';
import type { PlanningComputedValue } from '~api/types';

export function getComputedTransactionsForAccount(
  calculationRows: CalculationRows,
  year: number,
  now: Date,
  predictFromDate: Date,
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

  const predictedIncomeReduction = reducePredictedIncome(
    calculationRows,
    year,
    predictFromDate,
    incomeGroup,
  );
  const predictedIncome = getComputedPredictedIncomeForAccount(year, predictedIncomeReduction);

  const taxReliefRebateReduction = reduceTaxReliefRebate(
    calculationRows,
    year,
    now,
    predictFromDate,
    incomeGroup,
  );

  const taxReliefRebate = getComputedTaxReliefRebateForAccount(
    year,
    taxReliefRebateReduction,
    accountId,
  );

  const transfersReduction = reduceTransfers(calculationRows, accountId, now);
  const transfersValues = getComputedTransferValuesForAccount(year, transfersReduction);

  const billsReduction = reduceBillsForAccount(incomeGroup[0].id, calculationRows);
  const billsValues = getComputedBillsValuesForAccount(year, now, billsReduction);

  const computedValues: PlanningComputedValue[] = [
    ...previousIncome,
    ...predictedIncome,
    ...taxReliefRebate,
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
      taxReliefRebateReduction,
    ),
  );

  return {
    computedStartValue,
    computedValues,
    predictedCreditCardPayments,
  };
}
