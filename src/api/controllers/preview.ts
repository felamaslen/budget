import { startOfMonth, endOfMonth, differenceInDays, isSameDay, addDays } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import { selectPreviewRowsStocks, selectPreviewRowsStandard } from '~api/queries';
import {
  MonthlyCategory,
  OverviewPreview,
  PageListStandard,
  QueryOverviewPreviewArgs,
} from '~api/types';

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

  return dayEnds
    .map((date) => rows.find((row) => isSameDay(new Date(row.date), date))?.value ?? 0)
    .reduce<number[]>(
      (last, value, index) => (index > 0 ? [...last, last[last.length - 1] + value] : [value]),
      [],
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

  const values = await (query.category === MonthlyCategory.Stocks
    ? getOverviewPreviewStocks(db, uid, dayEnds)
    : getOverviewPreviewStandard(db, uid, dayEnds, query.category, startDate, endDate));

  return { startDate, values };
}
