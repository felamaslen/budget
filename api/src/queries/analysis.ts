import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType, ListSqlTokenType } from 'slonik';

import {
  AnalysisCategory,
  PeriodCost,
  PeriodCondition,
  PeriodCostDeep,
  CategoryTimelineRows,
  TimelineRow,
} from '~api/types';

const getAnalysisConditions = (uid: string, startTime: Date, endTime: Date): ListSqlTokenType =>
  sql.join(
    [
      sql`date >= ${format(startTime, 'yyyy-MM-dd')}`,
      sql`date <= ${format(endTime, 'yyyy-MM-dd')}`,
      sql`uid = ${uid}`,
      sql`cost > 0`,
    ],
    sql` AND `,
  );

export async function getIncome(
  db: DatabaseTransactionConnectionType,
  uid: string,
  startTime: Date,
  endTime: Date,
): Promise<number> {
  const result = await db.query<{ cost: number }>(sql`
  SELECT SUM(cost) AS cost
  FROM income
  WHERE ${getAnalysisConditions(uid, startTime, endTime)}
  `);

  return result.rows[0].cost;
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
  uid: string,
  startTime: Date,
  endTime: Date,
  category: AnalysisCategory,
  categoryColumn: string | null,
): Promise<readonly PeriodCost[]> {
  const result = await db.query<PeriodCost>(sql`
  SELECT ${periodCostColumns(categoryColumn)}
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime)}
  GROUP BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}

export async function getPeriodCostDeep(
  db: DatabaseTransactionConnectionType,
  uid: string,
  category: AnalysisCategory,
  categoryColumn: string | null,
  { startTime, endTime }: PeriodCondition,
): Promise<readonly PeriodCostDeep[]> {
  const result = await db.query<PeriodCostDeep>(sql`
  SELECT item, ${periodCostColumns(categoryColumn)}
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime)}
  GROUP BY item, ${sql.identifier(['itemCol'])}
  ORDER BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}

export async function getTimelineRows(
  db: DatabaseTransactionConnectionType,
  uid: string,
  startTime: Date,
  endTime: Date,
  category: AnalysisCategory,
): Promise<CategoryTimelineRows> {
  const result = await db.query<TimelineRow>(sql`
  SELECT date, SUM(cost) AS cost
  FROM ${sql.identifier([category])}
  WHERE ${getAnalysisConditions(uid, startTime, endTime)}
  GROUP BY date
  `);
  return result.rows;
}
