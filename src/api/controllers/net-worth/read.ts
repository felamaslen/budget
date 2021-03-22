import { endOfMonth } from 'date-fns';
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
} from '~api/queries';
import type { NetWorthCashTotal, NetWorthEntry, NetWorthEntryOverview } from '~api/types';

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
    return { cashInBank: 0, cashToInvest: 0, date: null };
  }

  const stockValueAtNetWorthDate = await getTotalFundValue(db, uid, netWorth.date);

  const cashToInvestAtNetWorthDate = netWorth.stocksIncludingCash - stockValueAtNetWorthDate;

  return {
    cashInBank: netWorth.cashInBank,
    cashToInvest: cashToInvestAtNetWorthDate,
    date: netWorth.date,
  };
}
