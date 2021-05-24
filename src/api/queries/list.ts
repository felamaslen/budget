import { sql, DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import {
  ListItemStandard,
  ListItemStandardInput,
  PageListCost,
  PageListStandard,
} from '~api/types';
import type { GQL, NativeDate, RawDate } from '~shared/types';

export const pageCostCTE = sql`
CASE
  WHEN page = ${PageListStandard.General} AND category = ANY(${sql.array(
  config.data.overview.investmentPurchaseCategories,
  'text',
)})
  THEN 0
  ELSE value
END
`;

export type StandardListRow = NativeDate<Omit<GQL<ListItemStandard>, 'cost'>, 'date'> & {
  value: number;
};

export async function countStandardRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
): Promise<number> {
  const result = await db.query<{ count: number }>(sql`
  SELECT COUNT(*) AS count
  FROM list_standard
  WHERE uid = ${uid} AND page = ${page}
  `);
  return result.rows[0].count ?? 0;
}

export const standardListPages = Object.values(PageListStandard);

export const spendingPages: PageListStandard[] = Object.values(PageListStandard).filter(
  (page) => page !== PageListStandard.Income,
);

export type StandardListTotalCostRow = { page: PageListStandard; total: number };

export async function selectListTotalCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page?: PageListCost,
): Promise<readonly StandardListTotalCostRow[]> {
  const { rows } = await db.query<StandardListTotalCostRow>(sql`
  SELECT page, COALESCE(SUM(${pageCostCTE}), 0)::int4 AS total
  FROM list_standard
  WHERE ${sql.join(
    [sql`uid = ${uid}`, page ? sql`page = ${page}` : null].filter(Boolean),
    sql` AND `,
  )}
  GROUP BY page
  `);
  return rows;
}

export type WeeklyCostRow = {
  year: number;
  weekly: number;
};

export async function selectListWeeklyCosts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
): Promise<readonly WeeklyCostRow[]> {
  const results = await db.query<WeeklyCostRow>(sql`
  WITH values AS (
    SELECT ${sql.join(
      [
        sql`${pageCostCTE} AS value`,
        sql`DATE_PART('year', date) AS year`,
        sql`DATE_PART('week', date) AS week`,
      ],
      sql`, `,
    )}
    FROM list_standard
    WHERE uid = ${uid} AND page = ${page}
  )
  SELECT year, (SUM(value) / GREATEST(1, MAX(week) - MIN(week)))::int4 AS weekly
  FROM values
  GROUP BY year
  ORDER BY year
  `);
  return results.rows;
}

export async function insertListItems(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
  items: RawDate<ListItemStandardInput, 'date'>[],
): Promise<number[]> {
  const result = await db.query<{ id: number }>(sql`
  INSERT INTO list_standard (page, uid, date, item, category, shop, value)
  SELECT * FROM ${sql.unnest(
    items.map((item) => [page, uid, item.date, item.item, item.category, item.shop, item.cost]),
    ['page_category', 'int4', 'date', 'text', 'text', 'text', 'int4'],
  )}
  RETURNING id
  `);
  return result.rows.map<number>((row) => row.id);
}

export async function selectListItems(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
  limit: number,
  offset: number,
): Promise<readonly GQL<NativeDate<ListItemStandard, 'date'>>[]> {
  const { rows } = await db.query(sql`
  SELECT id, date, item, category, shop, value AS cost
  FROM list_standard
  WHERE uid = ${uid} AND page = ${page}
  ORDER BY date DESC, id ASC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  `);
  return (rows as unknown) as readonly GQL<NativeDate<ListItemStandard, 'date'>>[];
}

export async function deleteListItem(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListCost,
  id: number,
): Promise<void> {
  await db.query(sql`
  DELETE FROM list_standard
  WHERE uid = ${uid} AND page = ${page} AND id = ${id}
  `);
}
