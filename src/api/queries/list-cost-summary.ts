import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { getMonthRangeUnion } from './date-union';
import { pageCostCTE, standardListPages } from './list';

import { PageListCost, PageListStandard } from '~api/types';
import { investmentPurchaseCategories } from '~shared/constants';

export async function selectSinglePageListSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dates: Date[],
  page: PageListCost,
): Promise<number[]> {
  const results = await db.query<{ sum: number }>(sql`
  WITH ${sql.join(
    [
      sql`dates AS (${getMonthRangeUnion(dates)})`,
      sql`
      list_deducted AS (
        SELECT ${sql.join(
          [
            sql`dates.start_date`,
            sql`list_standard.id`,
            sql`list_standard.value + COALESCE(SUM(income_deductions.value), 0) AS value`,
          ],
          sql`, `,
        )}
        FROM dates
        LEFT JOIN list_standard ON ${sql.join(
          [
            sql`uid = ${uid}`,
            sql`page = ${page}`,
            sql`date >= dates.start_date`,
            sql`date <= dates.end_date`,
          ],
          sql` AND `,
        )}
        LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
        GROUP BY start_date, list_standard.id
      )
      `,
    ],
    sql`, `,
  )}
  SELECT COALESCE(SUM(${pageCostCTE('list_deducted')}), 0)::int4 AS sum
  FROM list_deducted
  LEFT JOIN list_standard ON list_standard.id = list_deducted.id
  GROUP BY start_date
  ORDER BY start_date
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
  WITH ${sql.join(
    [
      sql`dates AS (${getMonthRangeUnion(dates)})`,
      sql`
      list_deducted AS (
        SELECT ${sql.join(
          [
            sql`dates.start_date`,
            sql`list_standard.id`,
            sql`list_standard.value + COALESCE(SUM(income_deductions.value), 0) AS value`,
          ],
          sql`, `,
        )}
        FROM dates
        LEFT JOIN list_standard ON ${sql.join(
          [sql`uid = ${uid}`, sql`date >= dates.start_date`, sql`date <= dates.end_date`],
          sql` AND `,
        )}
        LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
        GROUP BY start_date, list_standard.id
      )
      `,
    ],
    sql`, `,
  )}

  SELECT ${sql.join(
    [
      ...standardListPages.map(
        (page) => sql`COALESCE(SUM(
          CASE WHEN page = ${page} THEN (${pageCostCTE('list_deducted')}) ELSE 0 END
        ), 0)::int4 AS ${sql.identifier([page])}
        `,
      ),
      sql`COALESCE(SUM(
        CASE WHEN
          page != ${PageListStandard.Income}
          AND page = ${PageListStandard.General}
          AND category = ANY(${sql.array(investmentPurchaseCategories, 'text')})
        THEN list_deducted.value
        ELSE 0 END
      ), 0)::int4 AS investment_purchases`,
    ],
    sql`, `,
  )}
  FROM list_deducted
  LEFT JOIN list_standard ON list_standard.id = list_deducted.id
  GROUP BY start_date
  ORDER BY start_date
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
  WITH list_deducted AS (
    SELECT ${sql.join(
      [
        sql`list_standard.id`,
        sql`list_standard.value + COALESCE(SUM(income_deductions.value), 0) AS value`,
      ],
      sql`, `,
    )}
    FROM list_standard
    LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
    WHERE uid = ${uid} AND date < ${startDate}
    GROUP BY list_standard.id
  )
  SELECT page, (COALESCE(SUM(${pageCostCTE('list_deducted')}), 0))::int4 AS sum
  FROM list_deducted
  LEFT JOIN list_standard ON list_standard.id = list_deducted.id
  GROUP BY page
  `);
  return results.rows;
}

export type SpendingAndIncomeRow = {
  income: number;
  spending: number;
};

export async function selectSpendingAndIncomeSinceDate(
  db: DatabaseTransactionConnectionType,
  uid: number,
  sinceDate: string,
  now: string,
): Promise<SpendingAndIncomeRow> {
  const results = await db.query<SpendingAndIncomeRow>(sql`
  WITH list_deducted AS (
    SELECT ${sql.join(
      [
        sql`list_standard.id`,
        sql`list_standard.value + COALESCE(SUM(income_deductions.value), 0) AS value`,
      ],
      sql`, `,
    )}
    FROM list_standard
    LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
    WHERE uid = ${uid} AND date > ${sinceDate} AND date <= ${now}
    GROUP BY list_standard.id
  )
  SELECT ${sql.join(
    [
      sql`COALESCE(
        SUM(CASE WHEN page = ${PageListStandard.Income} THEN (${pageCostCTE(
        'list_deducted',
      )}) ELSE 0 END),
        0
      )::int4 AS income`,
      sql`COALESCE(
        SUM(CASE WHEN page != ${PageListStandard.Income} THEN (${pageCostCTE()}) ELSE 0 END),
        0
      )::int4 AS spending`,
    ],
    sql`, `,
  )}
  FROM list_deducted
  LEFT JOIN list_standard ON list_standard.id = list_deducted.id
  `);
  return results.rows[0] ?? { income: 0, spending: 0 };
}
