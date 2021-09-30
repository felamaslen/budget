import { addYears, addMonths, getUnixTime, startOfYear } from 'date-fns';
import { omit, uniqBy } from 'lodash';
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import { readNetWorthCashTotal } from './net-worth';
import { getAnnualisedFundReturns, getDisplayedFundValues } from './overview';

import config from '~api/config';
import { makeCrudController } from '~api/modules/crud';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  FundHistoryRow,
  FundListRow,
  FundMain,
  selectPreviousItem,
  selectFundHistoryNumResults,
  selectFundHistory,
  selectFundsByName,
  selectFundsItems,
  updateFundCacheItemReference,
  upsertCashTarget,
  upsertTransactions,
  updateAllocationTarget,
  selectAllocationTargetSum,
  selectIndividualFullFundHistory,
  upsertStockSplits,
  JoinedFundRow,
  JoinedFundRowWithTransactions,
  JoinedFundRowWithStockSplits,
} from '~api/queries';
import {
  AsyncReturnType,
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  Fund,
  FundHistory,
  FundHistoryIndividual,
  FundPeriod,
  FundPrices,
  FundSubscription,
  Maybe,
  MutationCreateFundArgs,
  MutationDeleteFundArgs,
  MutationUpdateCashAllocationTargetArgs,
  MutationUpdateFundAllocationTargetsArgs,
  MutationUpdateFundArgs,
  PageNonStandard as Page,
  QueryFundHistoryArgs,
  QueryFundHistoryIndividualArgs,
  ReadFundsResponse,
  StockSplit,
  TargetDeltaResponse,
  Transaction,
  UpdatedFundAllocationTargets,
} from '~api/types';

const baseController = makeCrudController<FundListRow, FundMain>({
  table: Page.Funds,
  item: 'Funds',
  dbMap: [{ external: 'allocationTarget', internal: 'allocation_target' }],
  withUid: true,
});

export { baseController as fundsControllerBase };

export function getMaxAge(now: Date, period?: Maybe<FundPeriod>, length?: Maybe<number>): Date {
  if (period === FundPeriod.Ytd) {
    return startOfYear(now);
  }
  if (!length) {
    return new Date(0);
  }
  if (period === FundPeriod.Month) {
    return addMonths(now, -length);
  }
  return addYears(now, -length);
}

export function processFundHistory(
  maxAge: Date,
  fundHistory: readonly FundHistoryRow[],
): Pick<FundHistory, 'startTime' | 'cacheTimes' | 'prices'> {
  const unixTimes = fundHistory.map(({ time }) => getUnixTime(new Date(time)));

  const prices = fundHistory.reduce<FundPrices[]>(
    (parent, { id, price }, timeIndex) =>
      id.reduce<FundPrices[]>((child, fundId, priceIndex) => {
        const fundIndex = child.findIndex((compare) => compare.fundId === fundId);

        const fundPrice = price[priceIndex];

        if (fundIndex === -1) {
          return [
            ...child,
            {
              fundId,
              groups: [
                {
                  startIndex: timeIndex,
                  values: [fundPrice],
                },
              ],
            },
          ];
        }

        const { groups } = child[fundIndex];

        const currentGroup = groups[groups.length - 1];
        const groupIsCurrent = currentGroup.values.length + currentGroup.startIndex === timeIndex;

        const newGroups = groupIsCurrent
          ? replaceAtIndex(groups, groups.length - 1, (group) => ({
              ...group,
              values: [...group.values, fundPrice],
            }))
          : [...groups, { startIndex: timeIndex, values: [fundPrice] }];

        return replaceAtIndex(child, fundIndex, (last) => ({ ...last, groups: newGroups }));
      }, parent),
    [],
  );

  return {
    startTime: unixTimes[0] ?? getUnixTime(maxAge),
    cacheTimes: unixTimes.map((time) => time - unixTimes[0]),
    prices,
  };
}

async function getFundPriceHistory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
  period: Maybe<FundPeriod> | undefined,
  length: Maybe<number> | undefined,
): Promise<Pick<FundHistory, 'startTime' | 'cacheTimes' | 'prices'>> {
  const maxAge = getMaxAge(now, period, length);
  const numResults = await selectFundHistoryNumResults(db, uid, maxAge);
  if (numResults < 3) {
    return {
      startTime: getUnixTime(maxAge),
      cacheTimes: [],
      prices: [],
    };
  }

  const fundHistory = await selectFundHistory(
    db,
    uid,
    numResults,
    config.data.funds.historyResolution,
    maxAge,
  );

  return processFundHistory(maxAge, fundHistory);
}

export async function readFundHistory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { period, length }: QueryFundHistoryArgs,
): Promise<FundHistory> {
  const now = new Date();

  const [dataWithHistory, annualisedFundReturns, overviewCost] = await Promise.all([
    getFundPriceHistory(db, uid, now, period, length),
    getAnnualisedFundReturns(db, uid, now),
    getDisplayedFundValues(db, uid, now),
  ]);

  return {
    ...dataWithHistory,
    annualisedFundReturns,
    overviewCost,
  };
}

export async function readFundHistoryIndividual(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id }: QueryFundHistoryIndividualArgs,
): Promise<FundHistoryIndividual> {
  const rows = await selectIndividualFullFundHistory(db, uid, id);
  const values = rows.map(({ date, price }) => ({ date: getUnixTime(date), price }));
  return { values };
}

export async function createFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { fakeId, input }: MutationCreateFundArgs,
): Promise<CrudResponseCreate> {
  const { id } = await baseController.create(db, uid, {
    item: input.item,
    allocationTarget: input.allocationTarget,
  });
  await Promise.all([
    upsertStockSplits(db, uid, id, input.stockSplits ?? []),
    upsertTransactions(db, uid, id, input.transactions),
  ]);

  const [overviewCost, cashTotal] = await Promise.all([
    getDisplayedFundValues(db, uid, new Date()),
    readNetWorthCashTotal(db, uid),
  ]);

  pubsub.publish<FundSubscription>(`${PubSubTopic.FundsChanged}.${uid}`, {
    created: {
      fakeId,
      item: {
        id,
        item: input.item,
        allocationTarget: input.allocationTarget,
        transactions: input.transactions,
        stockSplits: input.stockSplits ?? [],
      },
    },
    overviewCost,
  });
  pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);

  return { id };
}

const hasTransactions = (row: JoinedFundRow): row is JoinedFundRowWithTransactions =>
  !!row.transaction_ids[0];

const hasStockSplits = (row: JoinedFundRow): row is JoinedFundRowWithStockSplits =>
  !!row.stock_split_ids[0];

export async function readFunds(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<ReadFundsResponse> {
  const joinedRows = await selectFundsItems(db, uid);
  const items = joinedRows.map<Fund>((row) => ({
    id: row.id,
    item: row.item,
    allocationTarget: row.allocation_target,
    transactions: hasTransactions(row)
      ? uniqBy(
          row.transaction_ids.map<Transaction & { id: number }>((id, index) => ({
            id,
            date: new Date(row.transaction_dates[index]),
            units: row.transaction_units[index],
            price: row.transaction_prices[index],
            fees: row.transaction_fees[index],
            taxes: row.transaction_taxes[index],
            drip: row.transaction_drip[index],
            pension: row.transaction_pension[index],
          })),
          'id',
        ).map((tr) => omit(tr, 'id'))
      : [],
    stockSplits: hasStockSplits(row)
      ? uniqBy(
          row.stock_split_ids.map<StockSplit & { id: number }>((id, index) => ({
            id,
            date: new Date(row.stock_split_dates[index]),
            ratio: row.stock_split_ratios[index],
          })),
          'id',
        ).map((tr) => omit(tr, 'id'))
      : [],
  }));
  return { items };
}

export { selectCashTarget as readCashTarget } from '~api/queries';

export async function updateFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id, input }: MutationUpdateFundArgs,
): Promise<CrudResponseUpdate> {
  await Promise.all([
    upsertStockSplits(db, uid, id, input.stockSplits ?? []),
    upsertTransactions(db, uid, id, input.transactions),
  ]);

  const previousItem = await selectPreviousItem(db, id);

  await baseController.update(db, uid, id, {
    item: input.item,
    allocationTarget: input.allocationTarget,
  });

  const fundsWithSameName = await selectFundsByName(db, id);
  if (previousItem && fundsWithSameName.length === 1 && fundsWithSameName[0].uid === uid) {
    await updateFundCacheItemReference(db, fundsWithSameName[0].item, previousItem);
  }

  const [overviewCost, cashTotal] = await Promise.all([
    getDisplayedFundValues(db, uid, new Date()),
    readNetWorthCashTotal(db, uid),
  ]);

  pubsub.publish<FundSubscription>(`${PubSubTopic.FundsChanged}.${uid}`, {
    updated: {
      id,
      item: input.item,
      allocationTarget: input.allocationTarget,
      transactions: input.transactions,
      stockSplits: input.stockSplits ?? [],
    },
    overviewCost,
  });
  pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);

  return { error: null };
}

export async function deleteFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id }: MutationDeleteFundArgs,
): Promise<CrudResponseDelete> {
  await baseController.delete(db, uid, id);

  const [overviewCost, cashTotal] = await Promise.all([
    getDisplayedFundValues(db, uid, new Date()),
    readNetWorthCashTotal(db, uid),
  ]);
  await pubsub.publish<FundSubscription>(`${PubSubTopic.FundsChanged}.${uid}`, {
    deleted: id,
    overviewCost,
  });
  await pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);

  return { error: null };
}

export async function updateCashTarget(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationUpdateCashAllocationTargetArgs,
): Promise<CrudResponseCreate> {
  await upsertCashTarget(db, uid, args.target);
  await pubsub.publish(`${PubSubTopic.CashAllocationTargetUpdated}.${uid}`, args.target);
  return { error: null };
}

export async function updateFundAllocationTargets(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: MutationUpdateFundAllocationTargetsArgs,
): Promise<UpdatedFundAllocationTargets> {
  const ids = args.deltas.map(({ id }) => id);
  if (!ids.length) {
    return { deltas: [] };
  }

  const alreadyAllocated = await selectAllocationTargetSum(db, uid, ids);
  const remainingAllocation = 100 - alreadyAllocated;

  const deltaAllocation = args.deltas.reduce<number>(
    (last, { allocationTarget }) => last + allocationTarget,
    0,
  );

  const rebaseRatio = Math.max(0, Math.min(1, remainingAllocation / deltaAllocation));

  const rebasedDeltas = args.deltas.map((delta) => ({
    ...delta,
    allocationTarget: Math.round(delta.allocationTarget * rebaseRatio),
  }));

  const rows = await Promise.all(
    rebasedDeltas.map((delta) => updateAllocationTarget(db, uid, delta)),
  );

  const deltas = rows
    .filter((row): row is NonNullable<AsyncReturnType<typeof updateAllocationTarget>> => !!row)
    .map<TargetDeltaResponse>((row) => ({
      id: row.id,
      allocationTarget: row.allocation_target,
    }));

  await pubsub.publish(`${PubSubTopic.FundAllocationTargetsUpdated}.${uid}`, { deltas });
  return { deltas };
}
