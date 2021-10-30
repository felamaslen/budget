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
} from 'date-fns';
import { replaceAtIndex } from 'replace-array';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getPeriodCostForCategory, getPeriodCostDeep } from '~api/queries';
import {
  AnalysisPage,
  AnalysisPeriod,
  AnalysisGroupBy,
  AnalysisGroupColumn,
  AnalysisResponse,
  CategoryCostTree,
  CategoryCostTreeDeep,
  GetPeriodCondition,
  PeriodCondition,
  PeriodCost,
  QueryAnalysisArgs,
  QueryAnalysisDeepArgs,
} from '~api/types';

const CATEGORIES: AnalysisPage[] = Object.values(AnalysisPage);

const periodConditionWeekly: GetPeriodCondition = (now, pageIndex) => {
  const startTime = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), -pageIndex);
  const endTime = endOfWeek(startTime, { weekStartsOn: 1 });

  const description = `Week beginning ${format(startTime, 'MMMM d, yyyy')}`;

  return { startTime, endTime, description };
};

const periodConditionMonthly: GetPeriodCondition = (now, pageIndex) => {
  const startTime = addMonths(startOfMonth(now), -pageIndex);
  const endTime = endOfMonth(startTime);

  const description = format(startTime, 'MMMM yyyy');

  return { startTime, endTime, description };
};

const periodConditionYearly: GetPeriodCondition = (now, pageIndex) => {
  const startTime = addYears(startOfYear(now), -pageIndex);
  const endTime = endOfYear(startTime);

  const description = format(startTime, 'yyyy');

  return { startTime, endTime, description };
};

export function periodCondition(now: Date, period: AnalysisPeriod, pageIndex = 0): PeriodCondition {
  switch (period) {
    case AnalysisPeriod.Week:
      return periodConditionWeekly(now, pageIndex);
    case AnalysisPeriod.Month:
      return periodConditionMonthly(now, pageIndex);
    case AnalysisPeriod.Year:
    default:
      return periodConditionYearly(now, pageIndex);
  }
}

export function getCategoryColumn(groupBy: AnalysisGroupBy): AnalysisGroupColumn | null {
  switch (groupBy) {
    case AnalysisGroupBy.Shop:
      return 'shop';
    case AnalysisGroupBy.Category:
    default:
      return 'category';
  }
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
      getPeriodCostForCategory(db, uid, startTime, endTime, category, getCategoryColumn(groupBy)),
    ),
  );

  const categoryCostTree = periodCostByCategory.map<CategoryCostTree>((rows, index) => ({
    item: CATEGORIES[index],
    tree: rows.map((row) => ({
      category: row.itemCol,
      sum: row.cost,
    })),
  }));

  return {
    cost: categoryCostTree,
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
    getCategoryColumn(groupBy),
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
