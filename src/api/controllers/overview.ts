import {
  addMonths,
  differenceInDays,
  differenceInMonths,
  endOfMonth,
  isAfter,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from './shared';
import config from '~api/config';
import {
  getMonthlyTotalFundValues,
  getListCostSummary,
  getTotalFundValue,
  selectTransactions,
  selectOldNetWorth,
  getSpendingSummary,
  getMonthRangeUnion,
} from '~api/queries';
import {
  Transaction,
  Overview,
  QueryOverviewArgs,
  PageListStandard,
  QueryOverviewOldArgs,
  OverviewOld,
  OldNetWorthRow,
} from '~api/types';

const {
  startYear,
  startMonth,
  numLast: pastMonths,
  numFuture: futureMonths,
} = config.data.overview;

const getNumMonths = (now: Date, start: Date, withFuture: boolean): number =>
  (withFuture ? futureMonths : 0) + 1 + differenceInMonths(endOfMonth(now), startOfMonth(start));

const mapMonths = (now: Date, start: Date, withFuture = false): Date[] =>
  Array(getNumMonths(now, start, withFuture))
    .fill(0)
    .map((_, index) => endOfMonth(addMonths(start, index)));

const minStartTime = endOfMonth(setYear(setMonth(new Date(), startMonth - 1), startYear));

const getStartTime = (now: Date): Date => {
  const startTime = endOfMonth(addMonths(now, -pastMonths));
  return isAfter(startTime, minStartTime) ? startTime : minStartTime;
};

const getEndTime = (now: Date): Date => endOfMonth(addMonths(endOfMonth(now), futureMonths));

export const getDisplayedMonths = (now: Date, withFuture = true): Date[] =>
  mapMonths(now, getStartTime(now), withFuture);

const getOldMonths = (now: Date): Date[] =>
  mapMonths(subMonths(getStartTime(now), 1), minStartTime, false);

export async function getFundValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
  withFuture = false,
): Promise<number[]> {
  const monthlyValues = await getMonthlyTotalFundValues(db, uid, monthEnds);
  if (!withFuture) {
    return monthlyValues;
  }
  return [...monthlyValues, ...Array(futureMonths).fill(monthlyValues[monthlyValues.length - 1])];
}

export const getDisplayedFundValues = (
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<number[]> => getFundValues(db, uid, getDisplayedMonths(now, false));

async function getMonthlyCategoryValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<
  Pick<
    Overview['monthly'],
    'stocks' | 'income' | 'bills' | 'food' | 'general' | 'holiday' | 'social'
  >
> {
  const [stocks, income, bills, food, general, holiday, social] = await Promise.all<number[]>([
    getDisplayedFundValues(db, uid, now),
    ...Object.values(PageListStandard).map((category) =>
      getListCostSummary(db, uid, getDisplayedMonths(now, true), category),
    ),
  ]);

  return { stocks, income, bills, food, general, holiday, social };
}

export const DEFAULT_INVESTMENT_RATE = 0.07;

export function calculateXIRRFromTransactions(
  now: Date,
  currentValue: number,
  transactions: readonly Transaction[],
): number {
  if (!currentValue) {
    return DEFAULT_INVESTMENT_RATE;
  }

  const maxTries = 100;
  const initialGuess = 0.1;
  const tolerance = 0.001;

  const transactionDates = [...transactions.map(({ date }) => new Date(date)), now];

  const datesAsDayIndex = transactionDates.map((date) =>
    differenceInDays(date, transactionDates[0]),
  );

  const payments = [
    ...transactions.map(({ units, price, fees, taxes }) => -(units * price + fees + taxes)),
    currentValue,
  ];

  if (!payments.some((value) => value > 0) || !payments.some((value) => value < 0)) {
    return DEFAULT_INVESTMENT_RATE;
  }

  const xnpv = (rate: number): number =>
    datesAsDayIndex.reduce<number>(
      (last, date, index) => last + payments[index] / (1 + rate) ** (date / 365),
      0,
    );

  const xnpvDerivative = (rate: number): number =>
    datesAsDayIndex.reduce<number>(
      (last, date, index) =>
        last +
        (date / 365) *
          (1 + rate) ** (date / 365 - 1) *
          (-payments[index] / ((1 + rate) ** (date / 365)) ** 2),
      0,
    );

  return Array(maxTries)
    .fill(0)
    .reduce<{ done: boolean; value: number }>(
      (previous) => {
        if (previous.done) {
          return previous;
        }

        const next = previous.value - xnpv(previous.value) / xnpvDerivative(previous.value);
        if (Number.isNaN(next)) {
          return { done: true, value: DEFAULT_INVESTMENT_RATE };
        }

        return { done: Math.abs(next) < tolerance, value: next };
      },
      { done: false, value: initialGuess },
    ).value;
}

export async function getAnnualisedFundReturns(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<number> {
  const [currentFundsValue, transactions] = await Promise.all([
    getTotalFundValue(db, uid, now),
    selectTransactions(db, uid, now),
  ]);

  return calculateXIRRFromTransactions(now, currentFundsValue, transactions);
}

export function getOldDateBoundaries(now = new Date()): { startDate: Date; oldDateEnd: Date } {
  const oldDateEnd = startOfMonth(addMonths(now, -pastMonths));
  const startDate = startOfMonth(setMonth(setYear(now, startYear), startMonth - 1));

  return { startDate, oldDateEnd };
}

export async function getOverviewData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryOverviewArgs,
): Promise<Overview> {
  const now = args.now ?? new Date();

  const [monthly, annualisedFundReturns] = await Promise.all([
    getMonthlyCategoryValues(db, uid, now),
    getAnnualisedFundReturns(db, uid, now),
  ]);
  const startTime = getStartTime(now);
  const endTime = getEndTime(now);

  return {
    annualisedFundReturns,
    startDate: endOfMonth(startTime),
    endDate: endOfMonth(endTime),
    monthly,
  };
}

export async function getOldOverviewData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryOverviewOldArgs,
): Promise<OverviewOld> {
  const now = args.now ?? new Date();
  const { oldDateEnd, startDate } = getOldDateBoundaries(now);

  const monthEnds = getOldMonths(now);

  const [stocks, oldNetWorth, income, spending] = await Promise.all([
    getFundValues(db, uid, monthEnds),
    selectOldNetWorth(db, uid, formatDate(startDate), formatDate(oldDateEnd)),
    getListCostSummary(db, uid, monthEnds, PageListStandard.Income),
    getSpendingSummary(db, uid, getMonthRangeUnion(monthEnds)),
  ]);

  const mapNetWorth = (key: Exclude<keyof OldNetWorthRow, 'date'>): number[] =>
    monthEnds.map<number>(
      (date) => oldNetWorth.find((row) => isSameMonth(new Date(row.date), date))?.[key] ?? 0,
    );

  const pension = mapNetWorth('pension');
  const cashOther = mapNetWorth('locked_cash');
  const investments = mapNetWorth('investments'); // stocks + cash
  const options = mapNetWorth('options');
  const homeEquity = mapNetWorth('home_equity');
  const netWorth = mapNetWorth('net_worth'); // this excludes pension

  return {
    startDate: zonedTimeToUtc(endOfMonth(startDate), config.timeZone),
    stocks,
    pension,
    cashOther,
    investments,
    homeEquity,
    options,
    netWorth,
    income,
    spending,
  };
}
