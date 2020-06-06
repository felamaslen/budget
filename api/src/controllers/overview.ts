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
} from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { User } from '~api/modules/auth';
import { getMonthlyTotalFundValues, getListCostSummary } from '~api/queries';
import { OverviewResponse, Page, ListCategory } from '~api/types';

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

async function getMonthCost(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
  category: ListCategory,
): Promise<number[]> {
  if (category === Page.funds) {
    const monthEnds = getNonFutureMonths(now);
    const monthlyValues = await getMonthlyTotalFundValues(db, uid, monthEnds);
    return [...monthlyValues, ...Array(futureMonths).fill(monthlyValues[monthlyValues.length - 1])];
  }

  return getListCostSummary(db, uid, getDisplayedMonths(now), category);
}

async function getMonthlyCategoryValues(
  db: DatabaseTransactionConnectionType,
  user: User,
  now: Date,
): Promise<OverviewResponse['cost']> {
  const [funds, income, bills, food, general, holiday, social] = await Promise.all<number[]>(
    config.data.listCategories.map((category) => getMonthCost(db, user.uid, now, category)),
  );

  return { funds, income, bills, food, general, holiday, social };
}

const getYearMonth = (date: Date): [number, number] => [getYear(date), getMonth(date) + 1];

export async function getOverviewData(
  db: DatabaseTransactionConnectionType,
  user: User,
): Promise<OverviewResponse> {
  const now = new Date();
  const cost = await getMonthlyCategoryValues(db, user, now);

  return {
    startYearMonth: getYearMonth(getStartTime(now)),
    endYearMonth: getYearMonth(getEndTime(now)),
    currentYear: getYear(now),
    currentMonth: getMonth(now) + 1,
    futureMonths,
    cost,
  };
}
