import boom from '@hapi/boom';
import { startOfMonth, addMonths, endOfMonth } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import {
  countRows,
  getTotalFundCost,
  getListTotalCost,
  insertListItem,
  getListItems,
  updateListItem,
  deleteListItem,
  validateId,
  getListWeeklyCosts,
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
  uid: number,
  table: ListCategory,
  limit: number,
  offset: number,
): Promise<boolean> {
  const numRows = await countRows(db, uid, table);
  return numRows > limit * (offset + 1);
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
  uid: number,
  table: ListCategory,
): Promise<number> {
  if (table === Page.funds) {
    return getTotalFundCost(db, uid);
  }
  return getListTotalCost(db, uid, table);
}

export async function getWeeklyCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
): Promise<number> {
  if (table === Page.funds) {
    return 0;
  }
  const costs = await getListWeeklyCosts(db, uid, table);
  const decay = 0.7;
  return Math.round(
    costs.reduce<number>(
      (last, cost, index) => (index === 0 ? cost : decay * cost + (1 - decay) * last),
      0,
    ),
  );
}

export async function getUpdateResponse(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: ListCategory,
): Promise<UpdateResponse> {
  const [total, weekly] = await Promise.all([
    getTotalCost(db, uid, category),
    getWeeklyCost(db, uid, category),
  ]);
  return { total, weekly };
}

export async function createListData<I extends ListCalcItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: ListCalcCategory,
  item: CreateList<I>,
): Promise<CreateResponse> {
  const id = await insertListItem(db, uid, category, item);
  return { id, ...(await getUpdateResponse(db, uid, category)) };
}

const columnMapStandard: ColumnMap<ListCalcItem> = {
  I: 'id',
  d: 'date',
  i: 'item',
  c: 'cost',
};

export async function readListData<I extends ListCalcItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: ListCalcCategory,
  limit: number,
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

  const [olderExists, rows, updateResponse] = await Promise.all([
    getOlderExists(db, uid, category, limit, offset),
    getListItems<I>(db, uid, category, columns, limit, offset),
    getUpdateResponse(db, uid, category),
  ]);

  const data = rows.map<AbbreviatedItem<I>>(formatResults(columnMap));

  return { data, olderExists, ...updateResponse };
}

export async function updateListData<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: ListCategory,
  item: UpdateList<I>,
): Promise<UpdateResponse> {
  if (!(await validateId(db, uid, category, item.id))) {
    throw boom.notFound('Unknown id');
  }
  await updateListItem(db, uid, category, item);
  return getUpdateResponse(db, uid, category);
}

export async function deleteListData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: ListCategory,
  id: number,
): Promise<DeleteResponse> {
  if (!(await validateId(db, uid, category, id))) {
    throw boom.notFound('Unknown id');
  }
  await deleteListItem(db, uid, category, id);
  return getUpdateResponse(db, uid, category);
}
