import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getOldDateBoundaries } from '../overview';
import { formatDate } from '../shared';
import { combineJoinedEntryRows } from './shared';
import { selectEntry, selectAllEntries, selectOldNetWorth } from '~api/queries';
import { Entry } from '~api/types';

export async function fetchById(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<Entry> {
  const entryRows = await selectEntry(db, uid, netWorthId);
  return combineJoinedEntryRows(entryRows);
}
export async function fetchAll(
  db: DatabaseTransactionConnectionType,
  uid: number,
  oldDateEnd: Date,
): Promise<Entry[]> {
  const allRows = await selectAllEntries(db, uid, formatDate(oldDateEnd));
  const groupedRows = groupBy(allRows, 'id');

  return Object.values(groupedRows)
    .map(combineJoinedEntryRows)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchOld(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: Date,
  oldDateEnd: Date,
): Promise<{
  old: number[];
  oldOptions: number[];
}> {
  const rows = await selectOldNetWorth(db, uid, formatDate(startDate), formatDate(oldDateEnd));

  const old = rows.map(({ value }) => value);
  const oldOptions = rows.map(({ option_value }) => option_value);

  return { old, oldOptions };
}

export async function readNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<Entry> {
  const entry = await fetchById(db, uid, netWorthId);
  return entry;
}

export async function readAllNetWorthEntries(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<{
  items: Entry[];
  old: number[];
  oldOptions: number[];
}> {
  const { oldDateEnd, startDate } = getOldDateBoundaries();

  const [items, { old, oldOptions }] = await Promise.all([
    fetchAll(db, uid, oldDateEnd),
    fetchOld(db, uid, startDate, oldDateEnd),
  ]);

  return { items, old, oldOptions };
}
