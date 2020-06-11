import { startOfMonth, addMonths, setMonth, setYear } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate, combineJoinedEntryRows } from './shared';
import config from '~api/config';
import { selectEntry, selectAllEntries, selectOldNetWorth } from '~api/queries';
import { Entry } from '~api/types';

export async function fetchById(
  db: DatabaseTransactionConnectionType,
  uid: string,
  netWorthId: string,
): Promise<Entry> {
  const entryRows = await selectEntry(db, uid, netWorthId);
  return combineJoinedEntryRows(entryRows);
}
export async function fetchAll(
  db: DatabaseTransactionConnectionType,
  uid: string,
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
  uid: string,
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
  uid: string,
  netWorthId: string,
): Promise<Entry> {
  const entry = await fetchById(db, uid, netWorthId);
  return entry;
}

export async function readAllNetWorthEntries(
  db: DatabaseTransactionConnectionType,
  uid: string,
): Promise<{
  items: Entry[];
  old: number[];
  oldOptions: number[];
}> {
  const { numLast, startYear, startMonth } = config.data.overview;

  const oldDateEnd = startOfMonth(addMonths(new Date(), -numLast));
  const startDate = startOfMonth(setMonth(setYear(new Date(), startYear), startMonth));

  const [items, { old, oldOptions }] = await Promise.all([
    fetchAll(db, uid, oldDateEnd),
    fetchOld(db, uid, startDate, oldDateEnd),
  ]);

  return { items, old, oldOptions };
}
