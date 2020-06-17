import { addYears, addMonths, getUnixTime } from 'date-fns';
import md5 from 'md5';
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import { updateListData, getTotalCost, formatResults } from './list';

import config from '~api/config';
import {
  upsertTransactions,
  insertListItem,
  getFundsItems,
  getFundHistoryNumResults,
  getFundHistory,
  FundHistoryRow,
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

export const fundHash = (fundName: string, salt: string): string => md5(`${fundName}${salt}`);

type ResponseWithHistory = Omit<FundsResponseHistory, 'total'>;

export function processFundHistory(
  rows: AbbreviatedItem<Fund, typeof columnMapFunds>[],
  maxAge: Date,
  fundHistory: readonly FundHistoryRow[],
): ResponseWithHistory {
  const unixTimes = fundHistory.map(({ time }) => getUnixTime(new Date(time)));
  const cacheTimes = unixTimes.map((value) => value - unixTimes[0]);

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
                pr: [...fund.pr, price[priceIndex]],
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
  uid: string,
  now: Date,
  period: FundsParams['period'],
  length: number,
  rows: AbbreviatedItem<Fund, typeof columnMapFunds>[],
): Promise<ResponseWithHistory> {
  const maxAge = getMaxAge(now, period, length);
  const salt = config.data.funds.salt;
  const numResults = await getFundHistoryNumResults(db, uid, salt, maxAge);

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
    salt,
    numResults,
    config.data.funds.historyResolution,
    maxAge,
  );

  return processFundHistory(rows, maxAge, fundHistory);
}

export async function getFundsData(
  db: DatabaseTransactionConnectionType,
  uid: string,
  { history, period, length }: FundsParams,
  now: Date = new Date(),
): Promise<FundsResponse> {
  const [rows, total] = await Promise.all([
    getFundsItems(db, uid),
    getTotalCost(db, uid, Page.funds),
  ]);

  const data = rows.map<AbbreviatedItem<Fund, typeof columnMapFunds>>(
    formatResults(columnMapFunds),
  );

  if (!history) {
    return { data, total };
  }

  const dataWithHistory = await getFundPriceHistory(db, uid, now, period, length, data);
  return { ...dataWithHistory, total };
}

export async function createFund(
  db: DatabaseTransactionConnectionType,
  uid: string,
  { item, transactions }: CreateList<Fund>,
): Promise<Omit<CreateResponse, 'weekly'>> {
  const id = await insertListItem(db, uid, Page.funds, { item });
  await upsertTransactions(db, uid, id, transactions);
  const total = await getTotalCost(db, uid, Page.funds);

  return { id, total };
}

export async function updateFund(
  db: DatabaseTransactionConnectionType,
  uid: string,
  { id, item, transactions }: UpdateList<Fund>,
): Promise<UpdateResponse> {
  if (transactions) {
    await upsertTransactions(db, uid, id, transactions);
  }

  return updateListData(db, uid, Page.funds, { id, item });
}
