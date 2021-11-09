import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

import { sankeySpecialNames } from '~api/controllers/sankey.constants';
import { PageListStandard } from '~api/types';
import { investmentPurchaseCategories } from '~shared/constants';

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
      WHERE ${sql.join(
        [
          sql`uid = ${uid}`,
          sql`page = ${PageListStandard.Income}`,
          sql`item != ANY(${sql.array(sankeySpecialNames, 'text')})`,
        ],
        sql` AND `,
      )}
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
  SELECT item_name AS item, is_wages, (SUM(value) / 100)::int4 AS weight
  FROM items_named
  GROUP BY fin_year, item_name, is_wages
  `);
  return rows;
}

export type SankeyIncomeDeductionRow = {
  name: string;
  weight: number;
};

export async function selectSankeyDeductions(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly SankeyIncomeDeductionRow[]> {
  const { rows } = await db.query<SankeyIncomeDeductionRow>(sql`
  SELECT d.name, (SUM(d.value) / 100)::int4 AS weight
  FROM list_standard l
  INNER JOIN income_deductions d ON d.list_id = l.id
  WHERE ${sql.join(
    [
      sql`l.uid = ${uid}`,
      sql`l.page = ${PageListStandard.Income}`,
      sql`d.name != ANY(${sql.array(sankeySpecialNames, 'text')})`,
    ],
    sql` AND `,
  )}
  GROUP BY d.name
  `);
  return rows;
}

export type SankeyExpenseRow = {
  page: PageListStandard;
  category: string;
  weight: number;
};

export async function selectExpenses(
  db: DatabaseTransactionConnectionType,
  uid: number,
  endOfFinancialYear: Date,
): Promise<readonly SankeyExpenseRow[]> {
  const { rows } = await db.query<SankeyExpenseRow>(sql`
  SELECT l.page, l.category, (SUM(l.value) / 100)::int4 AS weight
  FROM list_standard l
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`date < ${formatISO(endOfFinancialYear, { representation: 'date' })}`,
      sql`page != ${PageListStandard.Income}`,
      sql`value > 0`,
      sql`category != ANY(${sql.array(investmentPurchaseCategories, 'text')})`,
      sql`category != ANY(${sql.array(sankeySpecialNames, 'text')})`,
    ],
    sql` AND `,
  )}
  GROUP BY l.page, l.category
  `);
  return rows;
}
