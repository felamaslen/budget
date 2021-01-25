import { startOfMonth, endOfMonth, differenceInDays, isSameDay, addDays } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  selectPreviewRowsStocks,
  selectPreviewRowsStandard,
  getSpendingSummary,
  getDateRangeUnion,
} from '~api/queries';
import {
  MonthlyCategory,
  OverviewPreview,
  PageListStandard,
  QueryOverviewPreviewArgs,
} from '~api/types';

const cumulativeFill = (values: number[]): number[] =>
  values.reduce<number[]>(
    (last, value, index) => (index > 0 ? [...last, last[last.length - 1] + value] : [value]),
    [],
  );

async function getOverviewPreviewStandard(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dayEnds: Date[],
  category: MonthlyCategory,
  startDate: Date,
  endDate: Date,
): Promise<number[]> {
  const rows = await selectPreviewRowsStandard(
    db,
    uid,
    (category as string) as PageListStandard,
    startDate,
    endDate,
  );

  return cumulativeFill(
    dayEnds.map((date) => rows.find((row) => isSameDay(new Date(row.date), date))?.value ?? 0),
  );
}

async function getOverviewPreviewStocks(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dayEnds: Date[],
): Promise<number[]> {
  const rows = await selectPreviewRowsStocks(db, uid, dayEnds);
  return dayEnds.reduce<number[]>(
    (last, date) => [
      ...last,
      rows.find((row) => isSameDay(new Date(row.date), date))?.value ?? last[last.length] ?? 0,
    ],
    [],
  );
}

async function getOverviewPreviewValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: MonthlyCategory,
  dayEnds: Date[],
  startDate: Date,
  endDate: Date,
): Promise<number[]> {
  switch (category) {
    case MonthlyCategory.Stocks:
      return getOverviewPreviewStocks(db, uid, dayEnds);
    case MonthlyCategory.Spending:
      return cumulativeFill(await getSpendingSummary(db, uid, getDateRangeUnion(dayEnds)));
    default:
      return getOverviewPreviewStandard(db, uid, dayEnds, category, startDate, endDate);
  }
}

export async function getOverviewPreview(
  db: DatabaseTransactionConnectionType,
  uid: number,
  query: QueryOverviewPreviewArgs,
): Promise<OverviewPreview> {
  const startDate = startOfMonth(query.date);
  const endDate = endOfMonth(query.date);
  const numDays = differenceInDays(endDate, startDate) + 1;

  const dayEnds = Array(numDays)
    .fill(0)
    .map((_, index) => addDays(startDate, index));

  const values = await getOverviewPreviewValues(
    db,
    uid,
    query.category,
    dayEnds,
    startDate,
    endDate,
  );

  return { startDate, values };
}
