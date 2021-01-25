import { addYears, addMonths, getUnixTime } from 'date-fns';
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getAnnualisedFundReturns, getDisplayedFundValues } from './overview';

import config from '~api/config';
import { makeCrudController } from '~api/modules/crud';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
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
} from '~api/queries';
import {
  CrudResponseCreate,
  CrudResponseUpdate,
  FundHistory,
  FundPeriod,
  FundPrices,
  Maybe,
  MutationUpdateCashAllocationTargetArgs,
  MutationCreateFundArgs,
  MutationUpdateFundArgs,
  PageNonStandard as Page,
  QueryFundHistoryArgs,
  ReadFundsResponse,
  MutationDeleteFundArgs,
  CrudResponseDelete,
  MutationUpdateFundAllocationTargetsArgs,
  TargetDeltaResponse,
  AsyncReturnType,
  UpdatedFundAllocationTargets,
  QueryFundHistoryIndividualArgs,
  FundHistoryIndividual,
} from '~api/types';

const dbMap: DJMap<FundListRow> = [{ external: 'allocationTarget', internal: 'allocation_target' }];

const baseController = makeCrudController<FundListRow, FundMain>({
  table: Page.Funds,
  item: 'Funds',
  jsonToDb: mapExternalToInternal(dbMap),
  dbToJson: mapInternalToExternal(dbMap),
  withUid: true,
});

export { baseController as fundsControllerBase };

export function getMaxAge(now: Date, period?: Maybe<FundPeriod>, length?: Maybe<number>): Date {
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
  { fakeId, input: { item, transactions, allocationTarget } }: MutationCreateFundArgs,
): Promise<CrudResponseCreate> {
  const { id } = await baseController.create(db, uid, {
    item,
    allocationTarget,
  });
  await upsertTransactions(db, uid, id, transactions);

  const overviewCost = await getDisplayedFundValues(db, uid, new Date());

  await pubsub.publish(`${PubSubTopic.FundCreated}.${uid}`, {
    id,
    fakeId,
    item: {
      item,
      allocationTarget,
      transactions,
    },
    overviewCost,
  });

  return { id };
}

export async function readFunds(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<ReadFundsResponse> {
  const items = await selectFundsItems(db, uid);
  return { items };
}

export { selectCashTarget as readCashTarget } from '~api/queries';

export async function updateFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id, input: { item, allocationTarget, transactions } }: MutationUpdateFundArgs,
): Promise<CrudResponseUpdate> {
  await upsertTransactions(db, uid, id, transactions);

  const previousItem = await selectPreviousItem(db, id);

  await baseController.update(db, uid, id, {
    item,
    allocationTarget,
  });

  const fundsWithSameName = await selectFundsByName(db, id);
  if (previousItem && fundsWithSameName.length === 1 && fundsWithSameName[0].uid === uid) {
    await updateFundCacheItemReference(db, fundsWithSameName[0].item, previousItem);
  }

  const overviewCost = await getDisplayedFundValues(db, uid, new Date());

  await pubsub.publish(`${PubSubTopic.FundUpdated}.${uid}`, {
    id,
    fakeId: null,
    item: {
      item,
      allocationTarget,
      transactions,
    },
    overviewCost,
  });

  return { error: null };
}

export async function deleteFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id }: MutationDeleteFundArgs,
): Promise<CrudResponseDelete> {
  await baseController.delete(db, uid, id);

  const overviewCost = await getDisplayedFundValues(db, uid, new Date());
  await pubsub.publish(`${PubSubTopic.FundDeleted}.${uid}`, { id, overviewCost });

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
