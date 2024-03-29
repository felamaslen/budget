import { compose } from '@typed/compose';
import { flatten } from 'array-flatten';
import { groupBy } from 'lodash';
import { DatabaseTransactionConnectionType } from 'slonik';

import { readNetWorthCashTotal } from './net-worth';
import { getDisplayedMonths } from './overview';
import { formatDate } from './shared';

import config from '~api/config';
import { makeCrudController } from '~api/modules/crud';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  countStandardRows,
  insertListItems,
  selectListItems,
  selectListTotalCost,
  selectListWeeklyCosts,
  selectSinglePageListSummary,
  StandardListRow,
  WeeklyCostRow,
} from '~api/queries';
import {
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  ListItemStandard,
  ListItemInput,
  ListItem,
  MutationCreateListItemArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListCost,
  QueryReadListArgs,
  ListItemStandardInput,
  PageListStandard,
  MutationCreateReceiptArgs,
  ReceiptCreated,
  ReceiptItem,
  ListReadResponse,
  QueryReadIncomeArgs,
  ListSubscription,
} from '~api/types';
import type { Create, RawDate } from '~shared/types';

const hasDate = <I extends Record<string, unknown>>(
  item: I | (I & { date: Date }),
): item is I & { date: Date } => Reflect.has(item, 'date');

function withFormattedDate<I extends ListItemStandard | ListItemInput>(item: I): RawDate<I, 'date'>;
function withFormattedDate<I extends ListItem | ListItemInput>(item: I): RawDate<I, 'date'>;
function withFormattedDate<I extends Record<string, unknown>>(item: I): Record<string, unknown> {
  if (hasDate(item)) {
    return { ...item, date: formatDate(item.date) };
  }
  return item;
}

const costToValue = <I extends { cost: number }>({
  cost,
  ...input
}: I): Omit<I, 'cost'> & { value: number } => ({ ...input, value: cost });

const valueToCost = <I extends { value: number }>({
  value,
  ...input
}: I): Omit<I, 'value'> & { cost: number } => ({ ...input, cost: value });

export async function getOlderExists(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
  limit: number,
  offset: number,
): Promise<boolean> {
  const numRows = await countStandardRows(db, uid, page);
  return numRows > limit * (offset + 1);
}

export function getWeeklyCost(rows: readonly WeeklyCostRow[]): number {
  const decay = 0.7;
  return Math.round(
    rows.reduce<number>(
      (prev, { weekly: value }, index) =>
        index === 0 ? value : decay * value + (1 - decay) * prev,
      0,
    ),
  );
}

export async function getListTotals(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
): Promise<{ total: number; weekly: number }> {
  const [totals, weeklyCostRows] = await Promise.all([
    selectListTotalCost(db, uid, page),
    selectListWeeklyCosts(db, uid, page),
  ]);
  const weekly = getWeeklyCost(weeklyCostRows);
  const total = totals[0]?.total ?? 0;
  return { total, weekly };
}

type PublishedProperties = {
  overviewCost: number[];
  total: number;
  weekly: number;
};

export async function getPublishedProperties(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListStandard,
): Promise<PublishedProperties> {
  const [overviewCost, listTotals] = await Promise.all([
    selectSinglePageListSummary(db, uid, getDisplayedMonths(new Date()), page),
    getListTotals(db, uid, page),
  ]);

  return { overviewCost, ...listTotals };
}

export const getLimitAndOffset = (
  args: QueryReadListArgs | QueryReadIncomeArgs,
): {
  limit: number;
  offset: number;
} => ({
  limit: args.limit ?? config.data.listPageLimit,
  offset: args.offset ?? 0,
});

export async function readList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadListArgs,
): Promise<ListReadResponse> {
  const { limit, offset } = getLimitAndOffset(args);

  const [rows, { total, weekly }, olderExists] = await Promise.all([
    selectListItems(db, uid, args.page, limit, offset),
    getListTotals(db, uid, args.page),
    getOlderExists(db, uid, args.page, limit, offset),
  ]);

  const items = rows.map<ListItemStandard>((row) => ({
    id: row.id,
    date: row.date,
    item: row.item,
    category: row.category,
    cost: row.cost,
    shop: row.shop,
  }));

  return { items, total, weekly, olderExists };
}

export const baseController = makeCrudController<StandardListRow, ListItemStandard>({
  table: 'list_standard',
  item: 'List item',
  jsonToDb: compose<Create<ListItemStandard>, Create<StandardListRow>, Create<StandardListRow>>(
    withFormattedDate,
    costToValue,
  ),
  dbToJson: valueToCost,
  withUid: true,
});

export const processInput = (
  page: PageListStandard,
  input: ListItemStandardInput,
): Create<ListItemStandard> & { page: PageListStandard } => ({
  ...input,
  page,
  date: new Date(input.date),
});

export async function createList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationCreateListItemArgs,
): Promise<CrudResponseCreate> {
  const { id, ...item } = await baseController.create(db, uid, processInput(args.page, args.input));

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, args.page),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<ListSubscription>(`${PubSubTopic.ListChanged}.${uid}`, {
      page: args.page,
      created: {
        fakeId: args.fakeId,
        item: { id, ...item },
      },
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);
  return { id };
}

export async function createReceipt(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationCreateReceiptArgs,
): Promise<ReceiptCreated> {
  const groupedItems = Object.values(groupBy(args.items, 'page'));

  const groupResults = await Promise.all(
    groupedItems.map((group) =>
      insertListItems(
        db,
        uid,
        group[0].page,
        group.map<RawDate<ListItemStandardInput, 'date'>>((item) => ({
          date: formatDate(args.date),
          item: item.item,
          cost: item.cost,
          category: item.category,
          shop: args.shop,
        })),
      ),
    ),
  );

  const receipt: ReceiptCreated = {
    items: flatten(
      groupedItems.map<ReceiptItem[]>((group, groupIndex) =>
        group.map<ReceiptItem>((input, index) => ({
          ...input,
          id: groupResults[groupIndex][index],
          date: args.date,
          shop: args.shop,
        })),
      ),
    ),
  };

  const cashTotal = await readNetWorthCashTotal(db, uid);

  await Promise.all([
    pubsub.publish(`${PubSubTopic.ReceiptCreated}.${uid}`, receipt),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);
  return receipt;
}

export async function updateList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationUpdateListItemArgs,
): Promise<CrudResponseUpdate> {
  const result = await baseController.update(db, uid, args.id, processInput(args.page, args.input));

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, args.page),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<ListSubscription>(`${PubSubTopic.ListChanged}.${uid}`, {
      page: args.page,
      updated: result,
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { error: null };
}

export async function deleteList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationDeleteListItemArgs,
): Promise<CrudResponseDelete> {
  await baseController.delete(db, uid, args.id);

  const [listPublishedProperties, cashTotal] = await Promise.all([
    getPublishedProperties(db, uid, args.page),
    readNetWorthCashTotal(db, uid),
  ]);

  await Promise.all([
    pubsub.publish<ListSubscription>(`${PubSubTopic.ListChanged}.${uid}`, {
      page: args.page,
      deleted: args.id,
      ...listPublishedProperties,
    }),
    pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal),
  ]);

  return { error: null };
}
