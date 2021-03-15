import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType, ListSqlTokenType } from 'slonik';

import config from '~api/config';
import {
  AnalysisPage,
  CategoryTimelineRows,
  PageListStandard,
  PeriodCost,
  PeriodCondition,
  PeriodCostDeep,
  TimelineRow,
} from '~api/types';

const getAnalysisConditions = (
  uid: number,
  startTime: Date,
  endTime: Date,
  category: AnalysisPage | PageListStandard.Income,
): ListSqlTokenType =>
  sql.join(
    [
      sql`date >= ${format(startTime, 'yyyy-MM-dd')}`,
      sql`date <= ${format(endTime, 'yyyy-MM-dd')}`,
      sql`uid = ${uid}`,
      sql`cost > 0`,
      category === AnalysisPage.General
        ? sql`category NOT IN (${sql.join(config.data.overview.ignoreExpenseCategories, sql`, `)})`
        : sql`1=1`,
    ],
    sql` AND `,
  );

export async function getIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startTime: Date,
  endTime: Date,
): Promise<number> {
  const result = await db.query<{ cost: number | null }>(sql`
  SELECT SUM(cost) AS cost
  FROM income
  WHERE ${getAnalysisConditions(uid, startTime, endTime, PageListStandard.Income)}
  `);

  return result.rows[0].cost ?? 0;
}

const periodCostColumns = (categoryColumn: string | null): ListSqlTokenType =>
  sql.join(
    [
      sql`${categoryColumn ? sql.identifier([categoryColumn]) : sql`NULL`} as ${sql.identifier([
        'itemCol',
      ])}`,
      sql`SUM(cost)::integer AS cost`,
    ],
    sql`, `,
  );

export async function getPeriodCostForCategory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startTime: Date,
  endTime: Date,
  category: AnalysisPage,
  categoryColumn: string | null,
): Promise<readonly PeriodCost[]> {
  const result = await db.query<PeriodCost>(sql`
  SELECT ${periodCostColumns(categoryColumn)}
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime, category)}
  GROUP BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}

export async function getPeriodCostDeep(
  db: DatabaseTransactionConnectionType,
  uid: number,
  category: AnalysisPage,
  categoryColumn: string | null,
  { startTime, endTime }: PeriodCondition,
): Promise<readonly PeriodCostDeep[]> {
  const result = await db.query<PeriodCostDeep>(sql`
  SELECT item, ${periodCostColumns(categoryColumn)}
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime, category)}
  GROUP BY item, ${sql.identifier(['itemCol'])}
  ORDER BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}

export async function getTimelineRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startTime: Date,
  endTime: Date,
  category: AnalysisPage,
): Promise<CategoryTimelineRows> {
  const result = await db.query<TimelineRow>(sql`
  SELECT date, SUM(cost) AS cost
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime, category)}
  GROUP BY date
  `);
  return result.rows;
}
