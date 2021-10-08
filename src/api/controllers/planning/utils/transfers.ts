import { isAfter } from 'date-fns';

import { CalculationRows } from '../types';

import type { PlanningComputedValue } from '~api/types';
import { evaluatePlanningValue } from '~shared/planning';

export type IntermediateTransfersReduction = {
  year: number;
  month: number;
  name: string;
  value: number;
  isVerified: boolean;
};

export function reduceTransfers(
  { accountsWithIncome, valueRows }: Pick<CalculationRows, 'accountsWithIncome' | 'valueRows'>,
  accountId: number,
  now: Date,
): IntermediateTransfersReduction[] {
  return valueRows
    .filter((row) => row.value_transfer_to === accountId)
    .map<IntermediateTransfersReduction>((row) => ({
      year: row.value_year,
      month: row.value_month,
      name: `${accountsWithIncome[row.id]?.[0].account ?? 'Unknown'} transfer`,
      value: -(evaluatePlanningValue(row.value_value, row.value_formula) ?? 0),
      isVerified: !isAfter(new Date(row.value_year, row.value_month), now),
    }));
}

export function getComputedTransferValuesForAccount(
  year: number,
  reduction: IntermediateTransfersReduction[],
): PlanningComputedValue[] {
  return reduction
    .filter((row) => row.year === year)
    .map<PlanningComputedValue>((row) => ({
      key: `transfer-${row.year}-${row.month}-${row.name}`,
      month: row.month,
      name: row.name,
      value: row.value,
      isVerified: row.isVerified,
      isTransfer: true,
    }));
}
