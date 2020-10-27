import { addYears, addMonths, getUnixTime } from 'date-fns';
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import { updateListData, getTotalCost, formatResults } from './list';
import { getAnnualisedFundReturns } from './overview';

import config from '~api/config';
import {
  upsertTransactions,
  insertListItem,
  getFundsItems,
  getFundHistoryNumResults,
  getFundHistory,
  FundHistoryRow,
  FundListRow,
  selectCashTarget,
  selectPreviousItem,
  updateFundCacheItemReference,
  selectFundsByName,
} from '~api/queries';
import {
  CreateResponse,
  UpdateResponse,
  Page,
  CreateList,
  UpdateList,
  Fund,
  FundsParams,
  FundsResponse,
  AbbreviatedItem,
  FundsResponseHistory,
  FundWithHistory,
  columnMapFunds,
} from '~api/types';

export function getMaxAge(now: Date, period: FundsParams['period'], length: number): Date {
  if (!length) {
    return new Date(0);
  }
  if (period === 'year') {
    return addYears(now, -length);
  }
  if (period === 'month') {
    return addMonths(now, -length);
  }

  throw new Error('Unrecognised period');
}

type ResponseWithHistory = Omit<FundsResponseHistory, 'total' | 'annualisedFundReturns'>;

export function processFundHistory(
  rows: AbbreviatedItem<Fund, typeof columnMapFunds>[],
  maxAge: Date,
  fundHistory: readonly FundHistoryRow[],
): ResponseWithHistory {
  const unixTimes = fundHistory.map(({ time }) => getUnixTime(new Date(time)));
  const cacheTimes = unixTimes.map((time) => time - unixTimes[0]);

  const data = fundHistory.reduce<FundWithHistory[]>(
    (last, { id, price }, index) =>
      id.reduce<FundWithHistory[]>(
        (next, fundId, priceIndex) =>
          replaceAtIndex(
            next,
            next.findIndex((fund) => fund.I === fundId),
            (fund: FundWithHistory) =>
              ({
                ...fund,
                pr: [
                  ...fund.pr,
                  ...(fund.pr.length > 0 && fund.pr.length + fund.prStartIndex < index
                    ? Array(index - (fund.prStartIndex + fund.pr.length)).fill(0)
                    : []),
                  Math.round(price[priceIndex] * 100) / 100,
                ],
                prStartIndex: fund.pr.length === 0 ? index : fund.prStartIndex,
              } as FundWithHistory),
          ),
        last,
      ),
    rows.map(
      (row) =>
        ({
          ...row,
          pr: [] as number[],
          prStartIndex: 0,
        } as FundWithHistory),
    ),
  );

  return {
    data,
    startTime: unixTimes[0] ?? getUnixTime(maxAge),
    cacheTimes,
  };
}

async function getFundPriceHistory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
  period: FundsParams['period'],
  length: number,
  rows: AbbreviatedItem<Fund, typeof columnMapFunds>[],
): Promise<ResponseWithHistory> {
  const maxAge = getMaxAge(now, period, length);
  const numResults = await getFundHistoryNumResults(db, uid, maxAge);

  if (numResults < 3) {
    return {
      data: rows.map(
        (fund) =>
          ({
            ...fund,
            pr: [] as number[],
            prStartIndex: 0,
          } as FundWithHistory),
      ),
      startTime: getUnixTime(maxAge),
      cacheTimes: [],
    };
  }

  const fundHistory = await getFundHistory(
    db,
    uid,
    numResults,
    config.data.funds.historyResolution,
    maxAge,
  );

  return processFundHistory(rows, maxAge, fundHistory);
}

export async function getFundsData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { history, period, length }: FundsParams,
  now: Date = new Date(),
): Promise<FundsResponse> {
  const [rows, total, cashTarget] = await Promise.all([
    getFundsItems(db, uid),
    getTotalCost(db, uid, Page.funds),
    selectCashTarget(db, uid),
  ]);

  const data = rows.map<AbbreviatedItem<Fund, typeof columnMapFunds>>(
    formatResults(columnMapFunds),
  );

  if (!history) {
    return { data, total, cashTarget };
  }

  const [dataWithHistory, annualisedFundReturns] = await Promise.all([
    getFundPriceHistory(db, uid, now, period, length, data),
    getAnnualisedFundReturns(db, uid, now),
  ]);

  return { ...dataWithHistory, total, cashTarget, annualisedFundReturns };
}

export async function createFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { item, transactions, allocationTarget }: CreateList<Fund>,
): Promise<Omit<CreateResponse, 'weekly'>> {
  const id = await insertListItem<FundListRow>(db, uid, Page.funds, {
    item,
    allocation_target: allocationTarget ?? null,
  });
  await upsertTransactions(db, uid, id, transactions);
  const total = await getTotalCost(db, uid, Page.funds);

  return { id, total };
}

export async function updateFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id, item, transactions, allocationTarget }: UpdateList<Fund>,
): Promise<UpdateResponse> {
  if (transactions) {
    await upsertTransactions(db, uid, id, transactions);
  }

  const previousItem = await selectPreviousItem(db, id);
  const updateResponse = await updateListData<FundListRow>(db, uid, Page.funds, {
    id,
    item,
    allocation_target: allocationTarget ?? null,
  });

  const fundsWithSameName = await selectFundsByName(db, id);
  if (previousItem && fundsWithSameName.length === 1 && fundsWithSameName[0].uid === uid) {
    await updateFundCacheItemReference(db, fundsWithSameName[0].item, previousItem);
  }

  return updateResponse;
}

export { upsertCashTarget } from '~api/queries/funds';
