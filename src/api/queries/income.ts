import { DatabaseTransactionConnectionType, sql } from 'slonik';
import type { ListItemStandardRow, WeeklyCostRow } from './list';
import { PageListStandard } from '~api/types';

export type IncomeDeductionRow = {
  readonly id: number;
  list_id: number;
  name: string;
  value: number;
};

export type IncomeRow = ListItemStandardRow;

type IncomeDeductionJoins = {
  readonly deduction_id: number | null;
  deduction_name: string | null;
  deduction_value: number | null;
};

export type IncomeRowWithJoins = IncomeRow & IncomeDeductionJoins;

export type IncomeRowWithDeduction = Omit<IncomeRowWithJoins, keyof IncomeDeductionJoins> & {
  [K in keyof IncomeDeductionJoins]: NonNullable<IncomeDeductionJoins[K]>;
};

export async function selectIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  limit: number,
  offset: number,
): Promise<readonly IncomeRowWithJoins[]> {
  const { rows } = await db.query<IncomeRowWithJoins>(sql`
  SELECT ${sql.join(
    [
      sql`l.id`,
      sql`l.date`,
      sql`l.item`,
      sql`l.category`,
      sql`l.shop`,
      sql`l.value AS cost`,
      sql`i.id AS deduction_id`,
      sql`i.name AS deduction_name`,
      sql`i.value AS deduction_value`,
    ],
    sql`, `,
  )}
  FROM list_standard l
  LEFT JOIN income_deductions i ON i.list_id = l.id
  WHERE l.uid = ${uid} AND l.page = ${'income'}
  ORDER BY l.date DESC, l.id ASC, i.id ASC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  `);
  return rows;
}

export type IncomeTotalsRow = {
  gross: number;
  deduction_name: string;
  deduction_value: number;
};

export async function selectIncomeTotals(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly IncomeTotalsRow[]> {
  const { rows } = await db.query<IncomeTotalsRow>(sql`
  WITH ${sql.join(
    [
      sql`income_sum AS (
      SELECT COALESCE(SUM(value), 0)::int4 AS gross
      FROM list_standard
      WHERE list_standard.uid = ${uid} AND list_standard.page = ${PageListStandard.Income}
    )`,
      sql`deduction_sums AS (
      SELECT ${sql.join(
        [
          sql`income_deductions.name AS deduction_name`,
          sql`COALESCE(SUM(income_deductions.value), 0)::int4 AS deduction_value`,
        ],
        sql`, `,
      )}
      FROM list_standard
      INNER JOIN income_deductions ON income_deductions.list_id = list_standard.id
      WHERE list_standard.uid = ${uid} AND list_standard.page = ${PageListStandard.Income}
      GROUP BY income_deductions.name
    )`,
    ],
    sql`, `,
  )}
  SELECT income_sum.*, deduction_sums.*
  FROM deduction_sums
  LEFT JOIN income_sum ON TRUE
  ORDER BY deduction_sums.deduction_value
  `);
  return rows;
}

export async function selectWeeklyNetIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly WeeklyCostRow[]> {
  const { rows } = await db.query<WeeklyCostRow>(sql`
  WITH values AS (
    SELECT ${sql.join(
      [
        sql`(list_standard.value + COALESCE(SUM(income_deductions.value), 0))::int4 AS value`,
        sql`DATE_PART('year', date) AS year`,
        sql`DATE_PART('week', date) AS week`,
      ],
      sql`, `,
    )}
    FROM list_standard
    LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
    WHERE uid = ${uid} AND page = ${PageListStandard.Income}
    GROUP BY list_standard.id
  )
  SELECT year, (SUM(value) / GREATEST(1, MAX(week) - MIN(week)))::int4 AS weekly
  FROM values
  GROUP BY year
  ORDER BY year
  `);
  return rows;
}

export async function insertIncomeDeductionRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  rows: Omit<IncomeDeductionRow, 'id'>[],
): Promise<readonly IncomeDeductionRow[]> {
  const result = await db.query<IncomeDeductionRow>(sql`
  INSERT INTO income_deductions (list_id, name, value)
  SELECT * FROM (
    SELECT new_items.*
    FROM ${sql.unnest(
      rows.map((row) => [row.list_id, row.name, row.value]),
      ['int4', 'text', 'int4'],
    )} AS new_items(list_id, name, value)
    INNER JOIN list_standard ON list_standard.id = new_items.list_id
      AND list_standard.uid = ${uid}
  ) items
  RETURNING *
  `);
  return result.rows;
}

export async function selectIncomeDeductionRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  listId: number,
): Promise<readonly IncomeDeductionRow[]> {
  const result = await db.query<IncomeDeductionRow>(sql`
  SELECT income_deductions.*
  FROM list_standard
  INNER JOIN income_deductions ON income_deductions.list_id = list_standard.id
  WHERE list_standard.uid = ${uid} AND list_standard.id = ${listId}
  ORDER BY income_deductions.id
  `);
  return result.rows;
}

export async function updateIncomeDeductionRow(
  db: DatabaseTransactionConnectionType,
  uid: number,
  updatedRow: IncomeDeductionRow,
): Promise<void> {
  await db.query(sql`
  UPDATE income_deductions
  SET name = ${updatedRow.name}, value = ${updatedRow.value}
  FROM list_standard
  WHERE list_standard.uid = ${uid}
    AND list_standard.id = ${updatedRow.list_id}
    AND income_deductions.list_id = list_standard.id
    AND income_deductions.id = ${updatedRow.id}
  `);
}

export async function deleteOldDeductionRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  listId: number,
  keepIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM income_deductions
  USING list_standard
  WHERE list_standard.uid = ${uid}
    AND list_standard.id = ${listId}
    AND income_deductions.list_id = list_standard.id
    AND income_deductions.id != ALL(${sql.array(keepIds, 'int4')})
  `);
}
