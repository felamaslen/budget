import { DatabaseTransactionConnectionType, sql } from 'slonik';
import { PageListStandard } from '~api/types';

export type SankeyIncomeRow = {
  item: string;
  weight: number;
  is_wages: boolean;
};

export async function selectSankeyIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly SankeyIncomeRow[]> {
  const { rows } = await db.query<SankeyIncomeRow>(sql`
  WITH ${sql.join(
    [
      sql`items AS (
      SELECT ${sql.join(
        [
          sql`
        CASE
          WHEN date_part('month', list_standard.date) <= 3 THEN date_part('year', list_standard.date) - 1
          ELSE date_part('year', list_standard.date)
        END AS fin_year`,
          sql`item`,
          sql`category`,
          sql`value`,
        ],
        sql`, `,
      )}
      FROM list_standard
      WHERE uid = ${uid} AND page = ${PageListStandard.Income}
    )`,
      sql`items_named AS (
      SELECT ${sql.join(
        [
          sql`*`,
          sql`
          CASE
            WHEN item ILIKE '%salary%' THEN 'Wages (' || fin_year || ')'
            ELSE category
          END AS item_name`,
          sql`item ILIKE '%salary%' AS is_wages`,
        ],
        sql`, `,
      )}
      FROM items
      ORDER BY fin_year
    )`,
    ],
    sql`, `,
  )}
  SELECT item_name AS item, is_wages, (SUM(value))::int4 AS weight
  FROM items_named
  GROUP BY fin_year, item_name, is_wages
  `);
  return rows;
}
