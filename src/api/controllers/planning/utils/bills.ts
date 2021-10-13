import { endOfMonth, getMonth, isAfter } from 'date-fns';

import type { CalculationRows } from '../types';
import type { PlanningComputedValue } from '~api/types';
import { getFinancialYear } from '~shared/planning';

export type IntermediateBillsReduction = {
  date: Date;
  year: number;
  month: number;
  bills: number;
};

export function reduceBillsForAccount(
  accountId: number,
  calculationRows: Pick<CalculationRows, 'billsRows'>,
): IntermediateBillsReduction[] {
  return calculationRows.billsRows
    .filter((row) => row.id === accountId)
    .map<IntermediateBillsReduction>((row) => ({
      date: endOfMonth(row.bills_date),
      year: getFinancialYear(row.bills_date),
      month: getMonth(row.bills_date),
      bills: row.bills_sum,
    }));
}

export function getComputedBillsValuesForAccount(
  year: number,
  now: Date,
  billsReduction: IntermediateBillsReduction[],
): PlanningComputedValue[] {
  return billsReduction
    .filter((row) => row.year === year)
    .map<PlanningComputedValue>((row) => ({
      key: `bills-${row.year}-${row.month}`,
      month: row.month,
      name: 'Bills',
      value: row.bills,
      isVerified: !isAfter(row.date, now),
      isTransfer: false,
    }));
}
