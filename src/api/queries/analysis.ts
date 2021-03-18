import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType, ListSqlTokenType } from 'slonik';

import config from '~api/config';
import {
  AnalysisPage,
  PageListStandard,
  PeriodCondition,
  PeriodCost,
  PeriodCostDeep,
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
