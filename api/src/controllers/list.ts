import boom from '@hapi/boom';
import { startOfMonth, addMonths, endOfMonth } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import {
  countOldRows,
  getTotalFundCost,
  getListTotalCost,
  insertListItem,
  getListItems,
  updateListItem,
  deleteListItem,
  validateId,
} from '~api/queries';
import {
  ListCategory,
  Page,
  ListItem,
  ColumnMap,
  AbbreviatedItem,
  ListResponse,
  ListCalcItem,
  ListCalcCategory,
  CreateList,
  UpdateList,
  CreateResponse,
  UpdateResponse,
  DeleteResponse,
} from '~api/types';

type LimitCondition = { startDate: Date; endDate: Date | null };

export function getLimitCondition(now: Date, numMonths: number, offset = 0): LimitCondition {
  const monthDiffStart = 1 - (offset + 1) * numMonths;
  const startDate = startOfMonth(addMonths(now, monthDiffStart));
  if (!offset) {
    return { startDate, endDate: null };
  }

  const endDate = endOfMonth(addMonths(startDate, numMonths - 1));
  return { startDate, endDate };
}

export async function getOlderExists(
  db: DatabaseTransactionConnectionType,
  uid: string,
  table: ListCategory,
  startDate: Date,
): Promise<boolean> {
  const numRows = await countOldRows(db, uid, table, startDate);
  return numRows > 0;
}

export const formatResults = <I extends ListItem, K extends ColumnMap<I>>(columnMap: K) => (
  row: I,
): AbbreviatedItem<I, K> =>
  Object.entries(columnMap).reduce(
    (last, [shortKey, longKey]) => ({
      ...last,
      [shortKey]: row[longKey],
    }),
    {} as AbbreviatedItem<I, K>,
  );

export async function getTotalCost(
  db: DatabaseTransactionConnectionType,
  uid: string,
  table: ListCategory,
): Promise<number> {
  if (table === Page.funds) {
    return getTotalFundCost(db, uid);
  }
  return getListTotalCost(db, uid, table);
}

export async function createListData<I extends ListCalcItem>(
  db: DatabaseTransactionConnectionType,
  uid: string,
  category: ListCalcCategory,
  item: CreateList<I>,
): Promise<CreateResponse> {
  const id = await insertListItem(db, uid, category, item);
  const total = await getTotalCost(db, uid, category);
  return { id, total };
}

const columnMapStandard: ColumnMap<ListCalcItem> = {
  I: 'id',
  d: 'date',
  i: 'item',
  c: 'cost',
};

export async function readListData<I extends ListCalcItem>(
  db: DatabaseTransactionConnectionType,
  uid: string,
  category: ListCalcCategory,
  now: Date,
  offset = 0,
): Promise<ListResponse<I>> {
  const columnMapExtra = config.data.columnMapExtra[category] as ColumnMap<
    Omit<I, keyof ListCalcItem>
  >;
  const columnMap = {
    ...columnMapStandard,
    ...columnMapExtra,
  } as ColumnMap<I>;

  const columns = Object.values(columnMap);

  const { startDate, endDate } = getLimitCondition(
    now,
    config.data.listPageLimits[category],
    offset,
  );

  const [olderExists, rows, total] = await Promise.all([
    getOlderExists(db, uid, category, startDate),
    getListItems<I>(db, uid, category, columns, startDate, endDate),
    getTotalCost(db, uid, category),
  ]);

  const data = rows.map<AbbreviatedItem<I>>(formatResults(columnMap));

  return { data, total, olderExists };
}

export async function updateListData<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: string,
  category: ListCategory,
  item: UpdateList<I>,
): Promise<UpdateResponse> {
  if (!(await validateId(db, uid, category, item.id))) {
    throw boom.notFound('Unknown id');
  }
  await updateListItem(db, uid, category, item);
  const total = await getTotalCost(db, uid, category);
  return { total };
}

export async function deleteListData(
  db: DatabaseTransactionConnectionType,
  uid: string,
  category: ListCategory,
  id: string,
): Promise<DeleteResponse> {
  if (!(await validateId(db, uid, category, id))) {
    throw boom.notFound('Unknown id');
  }
  await deleteListItem(db, uid, category, id);
  const total = await getTotalCost(db, uid, category);
  return { total };
}