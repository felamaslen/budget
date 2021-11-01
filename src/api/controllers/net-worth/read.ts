import { addDays, endOfMonth, formatISO } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '../shared';
import { combineJoinedEntryRows } from './shared';
import { getOldDateBoundaries } from '~api/controllers/overview';
import {
  selectEntry,
  selectAllEntries,
  selectLatestCashTotal,
  getTotalFundValue,
  selectSpendingAndIncomeSinceDate,
  selectNetWorthLoans,
  PensionTransactionOpts,
} from '~api/queries';
import {
  NetWorthCashTotal,
  NetWorthEntry,
  NetWorthEntryOverview,
  NetWorthLoan,
  NetWorthLoansResponse,
  NetWorthLoanValue,
} from '~api/types';

export async function fetchById(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<NetWorthEntry> {
  const entryRows = await selectEntry(db, uid, netWorthId);
  return combineJoinedEntryRows(entryRows);
}

export async function fetchAll(
  db: DatabaseTransactionConnectionType,
  uid: number,
  oldDateEnd: Date,
): Promise<NetWorthEntry[]> {
  const allRows = await selectAllEntries(db, uid, formatDate(oldDateEnd));
  const groupedRows = groupBy(allRows, 'id');

  return Object.values(groupedRows)
    .map(combineJoinedEntryRows)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function readNetWorthEntries(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<NetWorthEntryOverview> {
  const { oldDateEnd } = getOldDateBoundaries();
  const current = await fetchAll(db, uid, oldDateEnd);
  return { current };
}

export async function readNetWorthCashTotal(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<NetWorthCashTotal> {
  const now = new Date();
  const netWorth = await selectLatestCashTotal(db, uid, endOfMonth(now));

  if (!netWorth) {
    return {
      cashInBank: 0,
      stocksIncludingCash: 0,
      pensionStockValue: 0,
      nonPensionStockValue: 0,
      date: null,
      incomeSince: 0,
      spendingSince: 0,
    };
  }

  const [stockValuePension, stockValueNonPension, { income, spending }] = await Promise.all([
    getTotalFundValue(db, uid, addDays(netWorth.date, 1), PensionTransactionOpts.OnlyPension),
    getTotalFundValue(db, uid, addDays(netWorth.date, 1), PensionTransactionOpts.NotPension),
    selectSpendingAndIncomeSinceDate(
      db,
      uid,
      formatISO(netWorth.date, { representation: 'date' }),
      formatISO(now, { representation: 'date' }),
    ),
  ]);

  return {
    cashInBank: Math.max(0, netWorth.cashInBank),
    pensionStockValue: Math.max(0, stockValuePension),
    nonPensionStockValue: Math.max(0, stockValueNonPension),
    stocksIncludingCash: Math.max(0, netWorth.stocksIncludingCash),
    date: netWorth.date,
    incomeSince: income,
    spendingSince: spending,
  };
}

export async function readNetWorthLoans(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<NetWorthLoansResponse> {
  const rows = await selectNetWorthLoans(db, uid);
  const loans = Object.entries(groupBy(rows, 'subcategory')).map<NetWorthLoan>(([, group]) => ({
    subcategory: group[0].subcategory,
    values: group.map<NetWorthLoanValue>((row) => ({
      date: row.date,
      value: {
        principal: row.principal,
        rate: row.rate,
        paymentsRemaining: row.payments_remaining,
        paid: row.paid,
      },
    })),
  }));

  return { loans };
}
