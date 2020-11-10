import {
  format,
  startOfWeek,
  addWeeks,
  endOfWeek,
  startOfMonth,
  addMonths,
  endOfMonth,
  startOfYear,
  addYears,
  endOfYear,
  getDaysInMonth,
  getYear,
  getMonth,
  getDate,
} from 'date-fns';
import merge from 'deepmerge';
import { DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { User } from '~api/modules/auth';
import {
  getIncome,
  getPeriodCostForCategory,
  getPeriodCostDeep,
  getTimelineRows,
} from '~api/queries';
import {
  Page,
  AnalysisParams,
  CategoryCostTree,
  AnalysisCategory,
  AnalysisTimeline,
  AnalysisPeriod,
  PeriodCondition,
  GetPeriodCondition,
  PeriodCost,
  CategoryTimelineRows,
  AnalysisGroupColumn,
  AnalysisGroupBy,
  CostsByDate,
  AnalysisParamsDeep,
} from '~api/types';

const CATEGORIES: AnalysisCategory[] = [
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
];

const periodConditionWeekly: GetPeriodCondition = (now, pageIndex = 0) => {
  const startTime = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), -pageIndex);
  const endTime = endOfWeek(startTime, { weekStartsOn: 1 });

  const description = `Week beginning ${format(startTime, 'MMMM d, yyyy')}`;

  return { startTime, endTime, description };
};

const periodConditionMonthly: GetPeriodCondition = (now, pageIndex = 0) => {
  const startTime = addMonths(startOfMonth(now), -pageIndex);
  const endTime = endOfMonth(startTime);

  const description = format(startTime, 'MMMM yyyy');

  return { startTime, endTime, description };
};

const periodConditionYearly: GetPeriodCondition = (now, pageIndex = 0) => {
  const startTime = addYears(startOfYear(now), -pageIndex);
  const endTime = endOfYear(startTime);

  const description = format(startTime, 'yyyy');

  return { startTime, endTime, description };
};

export function periodCondition(now: Date, period: AnalysisPeriod, pageIndex = 0): PeriodCondition {
  if (period === 'week') {
    return periodConditionWeekly(now, pageIndex);
  }
  if (period === 'month') {
    return periodConditionMonthly(now, pageIndex);
  }
  if (period === 'year') {
    return periodConditionYearly(now, pageIndex);
  }

  throw new Error('Invalid period parameter');
}

export function getCategoryColumn(
  category: AnalysisCategory,
  groupBy?: AnalysisGroupBy,
): AnalysisGroupColumn | null {
  if (category === Page.bills) {
    return 'item';
  }
  if (groupBy === 'category') {
    if (config.data.listExtendedCategories.includes(category)) {
      return 'category';
    }

    return 'item';
  }

  if (groupBy === 'shop') {
    return 'shop';
  }

  return null;
}

export const getCostsByDate = (results: CategoryTimelineRows[]): CostsByDate =>
  results.reduce<CostsByDate>(
    (timeline, categoryRows, categoryIndex) =>
      categoryRows.reduce<CostsByDate>((timelineByDate, { date: dateString, cost }) => {
        const date = new Date(dateString);

        const year = getYear(date);
        const month = getMonth(date);
        const day = getDate(date);

        const preceding = timelineByDate[year]?.[month]?.[day] ? [] : Array(categoryIndex).fill(0);

        return merge(timelineByDate, {
          [year]: {
            [month]: {
              [day]: [...preceding, cost],
            },
          },
        });
      }, timeline),
    {},
  );

export function processTimelineData(
  timelineRows: CategoryTimelineRows[],
  period: AnalysisPeriod,
  { startTime }: Pick<PeriodCondition, 'startTime'>,
): AnalysisTimeline | null {
  const costsByDate = getCostsByDate(timelineRows);

  const year = getYear(startTime);

  if (period === 'year') {
    return Array(12)
      .fill(0)
      .reduce<AnalysisTimeline>((items, _, index) => {
        const date = addMonths(startTime, index);
        const month = getMonth(date);
        const daysInMonth = getDaysInMonth(date);

        return items.concat(
          Array(daysInMonth)
            .fill(0)
            .map<number[]>((__, dayIndex) => costsByDate[year]?.[month]?.[dayIndex + 1] ?? []),
        );
      }, []);
  }

  if (period === 'month') {
    const month = getMonth(startTime);
    const daysInMonth = getDaysInMonth(startTime);

    return Array(daysInMonth)
      .fill(0)
      .map<number[]>((_, dayIndex) => costsByDate[year]?.[month]?.[dayIndex + 1] ?? []);
  }

  return null;
}

export async function getAnalysisData(
  db: DatabaseTransactionConnectionType,
  user: User,
  { period = 'year', groupBy = 'category', pageIndex = 0 }: Partial<AnalysisParams>,
  now: Date = new Date(),
): Promise<{
  timeline: AnalysisTimeline | null;
  cost: CategoryCostTree<AnalysisCategory>[];
  saved: number;
  description: string;
}> {
  const condition = periodCondition(now, period, pageIndex);

  const { startTime, endTime, description } = condition;

  const periodCostByCategory = await Promise.all<readonly PeriodCost[]>(
    CATEGORIES.map((category) =>
      getPeriodCostForCategory(
        db,
        user.uid,
        startTime,
        endTime,
        category,
        getCategoryColumn(category as AnalysisCategory, groupBy),
      ),
    ),
  );

  const [income, timelineRows] = await Promise.all<number, CategoryTimelineRows[]>([
    getIncome(db, user.uid, startTime, endTime),

    Promise.all<CategoryTimelineRows>(
      CATEGORIES.map(async (category) =>
        getTimelineRows(db, user.uid, startTime, endTime, category),
      ),
    ),
  ]);

  const categoryCostTree = periodCostByCategory.map<CategoryCostTree<AnalysisCategory>>(
    (rows, index) => [CATEGORIES[index], rows.map(({ itemCol, cost }) => [itemCol, cost])],
  );

  const totalCost = periodCostByCategory.reduce<number>(
    (sum, result) => result.reduce<number>((resultSum, { cost }) => resultSum + cost, sum),
    0,
  );

  const saved = Math.max(0, income - totalCost);

  const timeline = processTimelineData(timelineRows, period, condition);

  return {
    timeline,
    cost: categoryCostTree,
    saved,
    description,
  };
}

export async function getDeepAnalysisData(
  db: DatabaseTransactionConnectionType,
  user: User,
  { period, groupBy, pageIndex, category }: AnalysisParamsDeep,
  now: Date = new Date(),
): Promise<CategoryCostTree[]> {
  const rows = await getPeriodCostDeep(
    db,
    user.uid,
    category,
    getCategoryColumn(category, groupBy),
    periodCondition(now, period, pageIndex),
  );

  return rows.reduce<CategoryCostTree[]>(
    (last, { itemCol, item, cost }) =>
      itemCol === last[last.length - 1]?.[0]
        ? [
            ...last.slice(0, last.length - 1),
            [itemCol, [...last[last.length - 1][1], [item, cost]]],
          ]
        : [...last, [itemCol, [[item, cost]]]],
    [],
  );
}
