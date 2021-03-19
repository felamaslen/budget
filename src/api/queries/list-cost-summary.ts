import {
  sql,
  DatabaseTransactionConnectionType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';
import { getMonthRangeUnion } from './date-union';
import config from '~api/config';
import { PageListStandard } from '~api/types';

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
  SELECT COALESCE(SUM(cost), 0) AS month_cost
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
  SELECT COALESCE(SUM(cost), 0) AS month_cost
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

export async function getSpendingSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  dates: TaggedTemplateLiteralInvocationType<{ start_date: string; end_date: string }[]>,
): Promise<number[]> {
  const results = await db.query<{ month_cost: number }>(sql`
  WITH ${sql.join(
    [
      sql`dates AS (${dates})`,

      sql`sum_bills AS (
        SELECT dates.start_date, COALESCE(SUM(bills.cost), 0) AS cost
        FROM dates
        ${joinCategory(uid, PageListStandard.Bills)}
        GROUP BY dates.start_date
      )`,
      sql`sum_food AS (
        SELECT dates.start_date, COALESCE(SUM(food.cost), 0) AS cost
        FROM dates
        ${joinCategory(uid, PageListStandard.Food)}
        GROUP BY dates.start_date
      )`,
      sql`sum_general AS (
        SELECT dates.start_date, COALESCE(SUM(
          CASE
            WHEN general.category IN (${sql.join(
              config.data.overview.investmentPurchaseCategories,
              sql`, `,
            )})
            THEN 0
            ELSE general.cost
            END
        ), 0) AS cost
        FROM dates
        ${joinCategory(uid, PageListStandard.General)}
        GROUP BY dates.start_date
      )`,
      sql`sum_holiday AS (
        SELECT dates.start_date, COALESCE(SUM(holiday.cost), 0) AS cost
        FROM dates
        ${joinCategory(uid, PageListStandard.Holiday)}
        GROUP BY dates.start_date
      )`,
      sql`sum_social AS (
        SELECT dates.start_date, COALESCE(SUM(social.cost), 0) AS cost
        FROM dates
        ${joinCategory(uid, PageListStandard.Social)}
        GROUP BY dates.start_date
      )`,
    ],
    sql`, `,
  )}

  SELECT ${sql.join(
    [
      sql`sum_bills.cost`,
      sql`sum_food.cost`,
      sql`sum_general.cost`,
      sql`sum_holiday.cost`,
      sql`sum_social.cost`,
    ],
    sql` + `,
  )} AS month_cost
  FROM dates
  LEFT JOIN sum_bills ON sum_bills.start_date = dates.start_date
  LEFT JOIN sum_food ON sum_food.start_date = dates.start_date
  LEFT JOIN sum_general ON sum_general.start_date = dates.start_date
  LEFT JOIN sum_holiday ON sum_holiday.start_date = dates.start_date
  LEFT JOIN sum_social ON sum_social.start_date = dates.start_date
  ORDER BY dates.start_date
  `);
  return results.rows.map(({ month_cost }) => month_cost);
}
