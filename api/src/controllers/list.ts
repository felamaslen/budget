import { flatten } from 'array-flatten';
import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getMonthCost } from './overview';
import { formatDate } from './shared';

import config from '~api/config';
import { makeCrudController } from '~api/modules/crud';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  countRows,
  insertListItems,
  selectListItems,
  selectListTotalCost,
  selectListWeeklyCosts,
} from '~api/queries';
import {
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  ListItemStandard,
  ListItemInput,
  ListItem,
  ListItemExtended,
  ListReadResponse,
  ListReadResponseExtended,
  MutationCreateListItemArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListCost,
  QueryReadListArgs,
  QueryReadListExtendedArgs,
  RawDate,
  TypeMap,
  QueryReadListTotalsArgs,
  ListTotalsResponse,
  ListItemStandardInput,
  Create,
  PageListStandard,
  MutationCreateReceiptArgs,
  ReceiptInput,
  ReceiptCreated,
  ReceiptItem,
} from '~api/types';

const hasDate = <I extends Record<string, unknown>>(
  item: I | (I & { date: Date }),
): item is I & { date: Date } => Reflect.has(item, 'date');

function withFormattedDate<I extends ListItemStandard | ListItemInput>(item: I): RawDate<I>;
function withFormattedDate<I extends ListItem | ListItemInput>(item: I): RawDate<I>;
function withFormattedDate<I extends Record<string, unknown>>(item: I): Record<string, unknown> {
  if (hasDate(item)) {
    return { ...item, date: formatDate(item.date) };
  }
  return item;
}

export async function getOlderExists(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
  limit: number,
  offset: number,
): Promise<boolean> {
  const numRows = await countRows(db, uid, table);
  return numRows > limit * (offset + 1);
}

export async function getWeeklyCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
): Promise<number> {
  const costs = await selectListWeeklyCosts(db, uid, table);
  const decay = 0.7;
  return Math.round(
    costs.reduce<number>(
      (last, cost, index) => (index === 0 ? cost : decay * cost + (1 - decay) * last),
      0,
    ),
  );
}

export async function getListTotals(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
): Promise<{ total: number; weekly: number }> {
  const [total, weekly] = await Promise.all([
    selectListTotalCost(db, uid, table),
    getWeeklyCost(db, uid, table),
  ]);

  return { total, weekly };
}

type PublishedProperties = {
  overviewCost: number[];
  total: number;
  weekly: number;
};

async function getPublishedProperties(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListStandard,
): Promise<PublishedProperties> {
  const [overviewCost, listTotals] = await Promise.all([
    getMonthCost(db, uid, new Date(), page),
    getListTotals(db, uid, page),
  ]);
  return { overviewCost, ...listTotals };
}

async function readListData<I extends ListItemStandard>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadListArgs | QueryReadListExtendedArgs,
  typeMap: TypeMap<RawDate<I>>,
): Promise<{
  items: I[];
  total: number;
  weekly: number;
  olderExists: boolean;
}> {
  const limit = args.limit ?? config.data.listPageLimit;
  const offset = args.offset ?? 0;

  const [rows, { total, weekly }, olderExists] = await Promise.all([
    selectListItems<I>(db, uid, args.page, typeMap, limit, offset),
    getListTotals(db, uid, args.page),
    getOlderExists(db, uid, args.page, limit, offset),
  ]);

  const items = rows.map<I>((row) => row);

  return { items, total, weekly, olderExists };
}

const baseController = makeCrudController<ListItemStandard>({
  table: 'list_base_fake_table_name',
  item: 'List item',
  jsonToDb: withFormattedDate,
  withUid: true,
});

const typeMapStandard: TypeMap<ListItemStandard> = {
  date: 'date',
  item: 'varchar',
  cost: 'int4',
};

const processInput = (
  input: ListItemStandardInput,
): Create<ListItemStandard> | Create<ListItemExtended> => ({
  ...input,
  date: new Date(input.date),
  category: input.category ?? undefined,
  shop: input.shop ?? undefined,
});

export async function createList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationCreateListItemArgs,
): Promise<CrudResponseCreate> {
  const { id, ...item } = await baseController.create(db, uid, processInput(args.input), args.page);

  await pubsub.publish(`${PubSubTopic.ListItemCreated}.${uid}`, {
    page: args.page,
    id,
    fakeId: args.fakeId,
    item,
    ...(await getPublishedProperties(db, uid, args.page)),
  });
  return { id };
}

export async function createReceipt(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationCreateReceiptArgs,
): Promise<ReceiptCreated> {
  const groupedItemsDictionary = groupBy(args.items, 'page');

  const groupedItems = Object.entries(groupedItemsDictionary) as [PageListCost, ReceiptInput[]][];

  const groupResults = await Promise.all(
    groupedItems.map(([table, group]) =>
      insertListItems<ListItemStandardInput>(
        db,
        uid,
        table,
        {
          date: 'date',
          item: 'varchar',
          cost: 'int4',
          category: 'varchar',
          shop: 'varchar',
        },
        group.map<RawDate<ListItemStandardInput>>((item) => ({
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
      groupedItems.map<ReceiptItem[]>(([, group], groupIndex) =>
        group.map<ReceiptItem>((input, index) => ({
          ...input,
          id: groupResults[groupIndex][index],
          date: args.date,
          shop: args.shop,
        })),
      ),
    ),
  };

  await pubsub.publish(`${PubSubTopic.ReceiptCreated}.${uid}`, receipt);
  return receipt;
}

export async function readList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadListArgs,
): Promise<ListReadResponse> {
  const result = await readListData<ListItemStandard>(db, uid, args, typeMapStandard);
  return result;
}

export async function readListExtended(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadListExtendedArgs,
): Promise<ListReadResponseExtended> {
  const result = await readListData<ListItemExtended>(db, uid, args, {
    ...typeMapStandard,
    category: 'varchar',
    shop: 'varchar',
  });
  return result;
}

export async function readListTotals(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReadListTotalsArgs,
): Promise<ListTotalsResponse> {
  const result = await getListTotals(db, uid, args.page);
  return result;
}

export async function updateList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationUpdateListItemArgs,
): Promise<CrudResponseUpdate> {
  await baseController.update(db, uid, args.id, processInput(args.input), args.page);

  await pubsub.publish(`${PubSubTopic.ListItemUpdated}.${uid}`, {
    page: args.page,
    id: args.id,
    item: args.input,
    ...(await getPublishedProperties(db, uid, args.page)),
  });

  return { error: null };
}

export async function deleteList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationDeleteListItemArgs,
): Promise<CrudResponseDelete> {
  await baseController.delete(db, uid, args.id, args.page);

  await pubsub.publish(`${PubSubTopic.ListItemDeleted}.${uid}`, {
    page: args.page,
    id: args.id,
    ...(await getPublishedProperties(db, uid, args.page)),
  });

  return { error: null };
}
