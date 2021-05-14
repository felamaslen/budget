import {
  sql,
  DatabaseTransactionConnectionType,
  TaggedTemplateLiteralInvocationType,
  IdentifierSqlTokenType,
} from 'slonik';
import { getMonthRangeUnion } from './date-union';
import config from '~api/config';
import { PageListStandard } from '~api/types';

const spendingPages: PageListStandard[] = Object.values(PageListStandard).filter(
  (page) => page !== PageListStandard.Income,
);

const joinCategory = (
  uid: number,
  category: PageListStandard,
  identifier: string = category,
): TaggedTemplateLiteralInvocationType => sql`
LEFT JOIN ${sql.identifier([category])} AS ${sql.identifier([identifier])} ON ${sql.join(
  [
    sql`${sql.identifier([identifier, 'uid'])} = ${uid}`,
    sql`${sql.identifier([identifier, 'date'])} >= dates.start_date`,
    sql`${sql.identifier([identifier, 'date'])} <= dates.end_date`,
  ],
  sql` AND `,
)}
`;

export async function getListCostSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
  category: PageListStandard,
): Promise<number[]> {
  const results = await db.query<{ month_cost: number }>(sql`
  SELECT COALESCE(SUM(cost), 0)::int4 AS month_cost
  FROM (${getMonthRangeUnion(monthEnds)}) dates
  ${joinCategory(uid, category, 'list_data')}
  ${
    category === PageListStandard.General
      ? sql`AND list_data.category NOT IN (${sql.join(
          config.data.overview.investmentPurchaseCategories,
          sql`, `,
        )})`
      : sql``
  }
  GROUP BY dates.start_date
  ORDER BY dates.start_date
  `);

  return results.rows.map(({ month_cost }) => month_cost);
}

export async function getInvestmentPurchasesSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
): Promise<number[]> {
  const results = await db.query<{ month_cost: number }>(sql`
  SELECT COALESCE(SUM(cost), 0)::int4 AS month_cost
  FROM (${getMonthRangeUnion(monthEnds)}) dates
  LEFT JOIN ${sql.identifier([PageListStandard.General])} AS ${sql.identifier([
    'general',
  ])} ON ${sql.join(
    [
      sql`${sql.identifier(['general', 'category'])} IN (${sql.join(
        config.data.overview.investmentPurchaseCategories,
        sql`, `,
      )})`,
      sql`${sql.identifier(['general', 'uid'])} = ${uid}`,
      sql`${sql.identifier(['general', 'date'])} >= dates.start_date`,
      sql`${sql.identifier(['general', 'date'])} <= dates.end_date`,
    ],
    sql` AND `,
  )}
  GROUP BY dates.start_date
  ORDER BY dates.start_date
  `);

  return results.rows.map(({ month_cost }) => month_cost);
}

const pageCostCTE = (
  page: PageListStandard,
): TaggedTemplateLiteralInvocationType | IdentifierSqlTokenType =>
  page === PageListStandard.General
    ? sql`
        CASE
          WHEN ${sql.identifier([page, 'category'])} IN (${sql.join(
        config.data.overview.investmentPurchaseCategories,
        sql`, `,
      )})
          THEN 0
          ELSE ${sql.identifier([page, 'cost'])}
        END
        `
    : sql.identifier([page, 'cost']);

export async function getSpendingSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dates: TaggedTemplateLiteralInvocationType<{ start_date: string; end_date: string }>,
): Promise<number[]> {
  const results = await db.query<{ month_cost: number }>(sql`
  WITH ${sql.join(
    [
      sql`dates AS (${dates})`,

      ...spendingPages.map(
        (page) => sql`
        ${sql.identifier([`sum_${page}`])} AS (
          SELECT dates.start_date, COALESCE(SUM(${pageCostCTE(page)}), 0)::int4 AS cost
          FROM dates
          ${joinCategory(uid, page)}
          GROUP BY dates.start_date
        )
        `,
      ),
    ],
    sql`, `,
  )}

  SELECT (${sql.join(
    spendingPages.map((page) => sql`${sql.identifier([`sum_${page}`, 'cost'])}`),
    sql` + `,
  )})::int4 AS month_cost

  FROM dates
  ${sql.join(
    spendingPages.map(
      (page) => sql`
      LEFT JOIN ${sql.identifier([`sum_${page}`])} ON ${sql.identifier([
        `sum_${page}`,
        'start_date',
      ])} = dates.start_date
      `,
    ),
    sql` `,
  )}
  ORDER BY dates.start_date
  `);
  return results.rows.map(({ month_cost }) => month_cost);
}

export async function selectInitialCumulativeIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
): Promise<number> {
  const results = await db.query<{ sum: number }>(sql`
  SELECT SUM(cost)::int4 AS sum
  FROM income
  WHERE uid = ${uid} AND date < ${startDate}
  `);
  return results.rows[0]?.sum ?? 0;
}

export async function selectInitialCumulativeSpending(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
): Promise<number> {
  const results = await db.query<{ sum: number }>(sql`
  WITH ${sql.join(
    spendingPages.map(
      (page) => sql`${sql.identifier([`sum_${page}`])} AS (
        SELECT COALESCE(SUM(
          ${pageCostCTE(page)}
        ), 0) AS sum
        FROM ${sql.identifier([page])}
        WHERE uid = ${uid} AND date < ${startDate}
      )`,
    ),
    sql`, `,
  )}

  SELECT (${sql.join(
    spendingPages.map((page) => sql`${sql.identifier([`sum_${page}`, 'sum'])}`),
    sql` + `,
  )})::int4 AS sum
  FROM (SELECT 1) r
  ${sql.join(
    spendingPages.map((page) => sql`LEFT JOIN ${sql.identifier([`sum_${page}`])} ON 1=1`),
    sql` `,
  )}
  `);
  return results.rows[0].sum ?? 0;
}
