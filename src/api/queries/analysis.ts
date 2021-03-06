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
  page: AnalysisPage | PageListStandard.Income,
): ListSqlTokenType =>
  sql.join(
    [
      sql`uid = ${uid}`,
      sql`page = ${page}`,
      sql`date >= ${format(startTime, 'yyyy-MM-dd')}`,
      sql`date <= ${format(endTime, 'yyyy-MM-dd')}`,
      sql`value > 0`,
      page === AnalysisPage.General
        ? sql`category != ALL(${sql.array(
            config.data.overview.investmentPurchaseCategories,
            'text',
          )})`
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
      sql`SUM(value)::int4 AS cost`,
    ],
    sql`, `,
  );

export async function getPeriodCostForCategory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startTime: Date,
  endTime: Date,
  page: AnalysisPage,
  categoryColumn: string | null,
): Promise<readonly PeriodCost[]> {
  const result = await db.query<PeriodCost>(sql`
  SELECT ${periodCostColumns(categoryColumn)}
  FROM list_standard
  WHERE ${getAnalysisConditions(uid, startTime, endTime, page)}
  GROUP BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}

export async function getPeriodCostDeep(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: AnalysisPage,
  categoryColumn: string | null,
  { startTime, endTime }: PeriodCondition,
): Promise<readonly PeriodCostDeep[]> {
  const result = await db.query<PeriodCostDeep>(sql`
  SELECT item, ${periodCostColumns(categoryColumn)}
  FROM list_standard
  WHERE ${getAnalysisConditions(uid, startTime, endTime, page)}
  GROUP BY item, ${sql.identifier(['itemCol'])}
  ORDER BY ${sql.identifier(['itemCol'])}
  `);
  return result.rows;
}
