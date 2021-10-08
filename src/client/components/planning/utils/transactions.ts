import isAfter from 'date-fns/isAfter';

import type { AccountTransaction, PlanningData, PlanningMonth, State } from '../types';

import { CREATE_ID } from '~client/constants/data';
import { evaluatePlanningValue } from '~shared/planning';

function sortComputedTransactions(a: AccountTransaction, b: AccountTransaction): -1 | 1 {
  if (a.name === 'Salary') {
    return -1;
  }
  if (b.name === 'Salary') {
    return 1;
  }
  return a.name < b.name ? -1 : 1;
}

export type TransactionsWithTaxRelief = {
  transactions: AccountTransaction[];
  taxRelief: number;
};

const filterOutZero = (transaction: AccountTransaction): boolean => transaction.computedValue !== 0;

function getManualTransactionsForAccountAtMonth(
  month: number,
  isPast: boolean,
  account: State['accounts'][0],
): AccountTransaction[] {
  return account.values
    .filter((row) => row.month === month)
    .map<AccountTransaction>((row) => ({
      key: `manual-transaction-${row.id ?? `${CREATE_ID}-${row.value}-${row.formula}`}`,
      name: row.name,
      computedValue: evaluatePlanningValue(row.value ?? null, row.formula ?? null),
      value: row.value ?? undefined,
      formula: row.formula ?? undefined,
      isVerified: isPast,
      isTransfer: !!row.transferToAccountId,
    }));
}

function getComputedTransactionsForAccountAtMonth(
  month: number,
  account: State['accounts'][0],
): AccountTransaction[] {
  return account.computedValues
    .filter((row) => row.month === month)
    .map<AccountTransaction>((row) => ({
      key: row.key,
      name: row.name,
      computedValue: row.value,
      isVerified: row.isVerified,
      isTransfer: row.isTransfer,
      isComputed: true,
    }))
    .filter(filterOutZero)
    .sort(sortComputedTransactions);
}

export function getTransactionsForAccountAtMonth(
  today: Date,
  accounts: State['accounts'],
  index: number,
  { month, date }: PlanningMonth,
): AccountTransaction[] {
  const isPast = isAfter(today, date);

  const computedTransactions = getComputedTransactionsForAccountAtMonth(month, accounts[index]);
  const manualTransactions = getManualTransactionsForAccountAtMonth(month, isPast, accounts[index]);

  return [...computedTransactions, ...manualTransactions];
}

export function nameIncluded(name: string, names: (string | RegExp)[]): boolean {
  return names.some((compare) =>
    typeof compare === 'string' ? compare === name : compare.test(name),
  );
}

export function sumComputedTransactionsByName(
  table: PlanningData[],
  ...names: (string | RegExp)[]
): number {
  return table.reduce<number>(
    (sum0, row) =>
      row.accounts.reduce<number>(
        (sum1, account) =>
          account.transactions.reduce<number>(
            (sum2, transaction) =>
              sum2 + (nameIncluded(transaction.name, names) ? transaction.computedValue ?? 0 : 0),
            sum1,
          ),
        sum0,
      ),
    0,
  );
}
