import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { getMonthRangeUnion } from './date-union';
import { pageCostCTE, standardListPages } from './list';

import config from '~api/config';
import { PageListCost, PageListStandard } from '~api/types';

export async function selectSinglePageListSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dates: Date[],
  page: PageListCost,
): Promise<number[]> {
  const results = await db.query<{ sum: number }>(sql`
  WITH dates AS (${getMonthRangeUnion(dates)})
  SELECT COALESCE(SUM(${pageCostCTE}), 0)::int4 AS sum
  FROM dates
  LEFT JOIN list_standard ON ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`date >= dates.start_date`,
      sql`date <= dates.end_date`,
      sql`page = ${page}`,
    ],
    sql` AND `,
  )}
  GROUP BY dates.start_date
  ORDER BY dates.start_date
  `);
  return results.rows.map((row) => row.sum);
}

export type CategorisedListSummaryRow = {
  investment_purchases: number;
} & Record<PageListStandard, number>;

export async function selectCategorisedListSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dates: Date[],
): Promise<readonly CategorisedListSummaryRow[]> {
  const results = await db.query<CategorisedListSummaryRow>(sql`
  WITH dates AS (${getMonthRangeUnion(dates)})
  SELECT ${sql.join(
    [
      ...standardListPages.map(
        (page) => sql`
        COALESCE(SUM(
          CASE WHEN page = ${page} THEN (${pageCostCTE}) ELSE 0 END
        ), 0)::int4 AS ${sql.identifier([page])}
        `,
      ),
      sql`COALESCE(SUM(
        CASE WHEN
          page != ${PageListStandard.Income}
          AND page = ${PageListStandard.General}
          AND category = ANY(${sql.array(
            config.data.overview.investmentPurchaseCategories,
            'text',
          )})
        THEN value
        ELSE 0 END
      ), 0)::int4 AS investment_purchases`,
    ],
    sql`, `,
  )}
  FROM dates
  LEFT JOIN list_standard ON ${sql.join(
    [sql`uid = ${uid}`, sql`date >= dates.start_date`, sql`date <= dates.end_date`],
    sql` AND `,
  )}
  GROUP BY dates.start_date
  ORDER BY dates.start_date
  `);
  return results.rows;
}

export type InitialCumulativeListRow = {
  page: PageListStandard;
  sum: number;
};

export async function selectInitialCumulativeList(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
): Promise<readonly InitialCumulativeListRow[]> {
  const results = await db.query<InitialCumulativeListRow>(sql`
  SELECT page, COALESCE(SUM(${pageCostCTE}), 0)::int4 AS sum
  FROM list_standard
  WHERE uid = ${uid} AND date < ${startDate}
  GROUP BY page
  `);
  return results.rows;
}
