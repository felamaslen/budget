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
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  getIncome,
  getPeriodCostForCategory,
  getPeriodCostDeep,
  getTimelineRows,
} from '~api/queries';
import {
  isExtendedPage,
  AnalysisPage,
  AnalysisPeriod,
  AnalysisGroupBy,
  AnalysisGroupColumn,
  AnalysisResponse,
  CategoryCostTree,
  CategoryCostTreeDeep,
  CategoryTimelineRows,
  CostsByDate,
  GetPeriodCondition,
  PeriodCondition,
  PeriodCost,
  QueryAnalysisArgs,
  QueryAnalysisDeepArgs,
} from '~api/types';

const CATEGORIES: AnalysisPage[] = Object.values(AnalysisPage);

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
  category: AnalysisPage,
  groupBy?: AnalysisGroupBy,
): AnalysisGroupColumn | null {
  if (category === AnalysisPage.Bills) {
    return 'item';
  }
  if (groupBy === AnalysisGroupBy.Category) {
    if (isExtendedPage(category)) {
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

type Timeline = Exclude<AnalysisResponse['timeline'], null | undefined>;

export function processTimelineData(
  timelineRows: CategoryTimelineRows[],
  period: AnalysisPeriod,
  { startTime }: Pick<PeriodCondition, 'startTime'>,
): Timeline | null {
  const costsByDate = getCostsByDate(timelineRows);

  const year = getYear(startTime);

  if (period === 'year') {
    return Array(12)
      .fill(0)
      .reduce<Timeline>((items, _, index) => {
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
  uid: number,
  { period, groupBy, page: pageIndex }: QueryAnalysisArgs,
  now: Date = new Date(),
): Promise<AnalysisResponse> {
  const condition = periodCondition(now, period, pageIndex ?? 0);

  const { startTime, endTime, description } = condition;

  const periodCostByCategory = await Promise.all<readonly PeriodCost[]>(
    CATEGORIES.map((category) =>
      getPeriodCostForCategory(
        db,
        uid,
        startTime,
        endTime,
        category,
        getCategoryColumn(category, groupBy),
      ),
    ),
  );

  const [income, timelineRows] = await Promise.all<number, CategoryTimelineRows[]>([
    getIncome(db, uid, startTime, endTime),

    Promise.all<CategoryTimelineRows>(
      CATEGORIES.map(async (category) => getTimelineRows(db, uid, startTime, endTime, category)),
    ),
  ]);

  const categoryCostTree = periodCostByCategory.map<CategoryCostTree>((rows, index) => ({
    item: CATEGORIES[index],
    tree: rows.map((row) => ({
      category: row.itemCol,
      sum: row.cost,
    })),
  }));

  const timeline = processTimelineData(timelineRows, period, condition);

  return {
    timeline,
    cost: categoryCostTree,
    income,
    description,
    startDate: startTime,
    endDate: endTime,
  };
}

export async function getDeepAnalysisData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { period, groupBy, page: pageIndex, category }: QueryAnalysisDeepArgs,
  now: Date = new Date(),
): Promise<CategoryCostTreeDeep[]> {
  const rows = await getPeriodCostDeep(
    db,
    uid,
    category,
    getCategoryColumn(category, groupBy),
    periodCondition(now, period, pageIndex ?? 0),
  );

  return rows.reduce<CategoryCostTreeDeep[]>((last, row) => {
    const treeItem = { category: row.item, sum: row.cost };

    if (row.itemCol === last[last.length - 1]?.item) {
      return replaceAtIndex(last, last.length - 1, (prev) => ({
        ...prev,
        tree: [...prev.tree, treeItem],
      }));
    }

    return [
      ...last,
      {
        item: row.itemCol,
        tree: [treeItem],
      },
    ];
  }, []);
}
