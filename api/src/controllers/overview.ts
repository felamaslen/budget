import {
  addMonths,
  setYear,
  setMonth,
  getYear,
  getMonth,
  isAfter,
  differenceInMonths,
  endOfMonth,
  startOfMonth,
  differenceInDays,
} from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import {
  getMonthlyTotalFundValues,
  getListCostSummary,
  getTotalFundValue,
  selectTransactions,
} from '~api/queries';
import { OverviewResponse, ListCategory, Transaction } from '~api/types';

const {
  startYear,
  startMonth,
  numLast: pastMonths,
  numFuture: futureMonths,
} = config.data.overview;

const minStartTime = endOfMonth(setYear(setMonth(new Date(), startMonth - 1), startYear));

const getStartTime = (now: Date): Date => {
  const startTime = endOfMonth(addMonths(now, -pastMonths));
  return isAfter(startTime, minStartTime) ? startTime : minStartTime;
};

const getEndTime = (now: Date): Date => endOfMonth(addMonths(endOfMonth(now), futureMonths));

const getNumMonths = (now: Date, start: Date, withFuture: boolean): number =>
  (withFuture ? futureMonths : 0) + 1 + differenceInMonths(endOfMonth(now), startOfMonth(start));

const mapMonths = (now: Date, start: Date, withFuture = false): Date[] =>
  Array(getNumMonths(now, start, withFuture))
    .fill(0)
    .map((_, index) => endOfMonth(addMonths(start, index)));

const getDisplayedMonths = (now: Date): Date[] => mapMonths(now, getStartTime(now), true);
const getNonFutureMonths = (now: Date): Date[] => mapMonths(now, minStartTime, false);

async function getFundValues(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
): Promise<number[]> {
  const monthEnds = getNonFutureMonths(now);
  const monthlyValues = await getMonthlyTotalFundValues(db, uid, monthEnds);
  return [...monthlyValues, ...Array(futureMonths).fill(monthlyValues[monthlyValues.length - 1])];
}

async function getMonthCost(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
  category: ListCategory,
): Promise<number[]> {
  return getListCostSummary(db, uid, getDisplayedMonths(now), category);
}

async function getMonthlyCategoryValues(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
): Promise<OverviewResponse['cost']> {
  const [funds, income, bills, food, general, holiday, social] = await Promise.all<number[]>([
    getFundValues(db, uid, now),
    ...config.data.listCategories.map((category) => getMonthCost(db, uid, now, category)),
  ]);

  return { funds, income, bills, food, general, holiday, social };
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

  const payments = [...transactions.map(({ cost }) => -cost), currentValue];

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

        return { done: Math.abs(next) < tolerance, value: next };
      },
      { done: false, value: initialGuess },
    ).value;
}

async function getAnnualisedFundReturns(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
): Promise<number> {
  const [currentFundsValue, transactions] = await Promise.all([
    getTotalFundValue(db, uid, now),
    selectTransactions(db, uid, now),
  ]);

  return calculateXIRRFromTransactions(now, currentFundsValue, transactions);
}

const getYearMonth = (date: Date): [number, number] => [getYear(date), getMonth(date) + 1];

export async function getOverviewData(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date = new Date(),
): Promise<OverviewResponse> {
  const [cost, annualisedFundReturns] = await Promise.all([
    getMonthlyCategoryValues(db, uid, now),
    getAnnualisedFundReturns(db, uid, now),
  ]);

  return {
    startYearMonth: getYearMonth(getStartTime(now)),
    endYearMonth: getYearMonth(getEndTime(now)),
    currentYear: getYear(now),
    currentMonth: getMonth(now) + 1,
    futureMonths,
    annualisedFundReturns,
    cost,
  };
}
