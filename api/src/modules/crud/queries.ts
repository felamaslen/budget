import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { Item } from './types';
import { Create } from '~api/types';

export async function getRowCount(
  db: DatabaseTransactionConnectionType,
  table: string,
  id: string,
): Promise<number> {
  const result = await db.query<{ count: number }>(sql`
  SELECT COUNT(*) AS count
  FROM ${sql.identifier([table])}
  WHERE id = ${id}
  `);
  return result.rows[0].count;
}

export async function insertCrudItem<D extends Item>(
  db: DatabaseTransactionConnectionType,
  table: string,
  row: Create<D>,
): Promise<D> {
  const result = await db.query<D & { id: string }>(sql`
  INSERT INTO ${sql.identifier([table])}
  (${sql.join(
    Object.keys(row).map((column) => sql.identifier([column])),
    sql`, `,
  )})
  VALUES (${sql.join(
    Object.values(row as object).map((value) => sql`${value}`),
    sql`, `,
  )})
  RETURNING *
  `);
  return result.rows[0];
}

export async function selectCrudItem<D extends Item>(
  db: DatabaseTransactionConnectionType,
  table: string,
  id: string,
): Promise<D | undefined> {
  const result = await db.query<D>(sql`
  SELECT * FROM ${sql.identifier([table])} WHERE id = ${id}
  `);
  return result.rows[0];
}

export async function selectAllCrudItems<D extends Item>(
  db: DatabaseTransactionConnectionType,
  table: string,
): Promise<readonly D[]> {
  const result = await db.query<D>(sql`
  SELECT * FROM ${sql.identifier([table])}
  `);
  return result.rows;
}

export async function updateCrudItem<D extends Item>(
  db: DatabaseTransactionConnectionType,
  table: string,
  id: string,
  data: Create<D>,
): Promise<D | undefined> {
  const result = await db.query<D>(sql`
  UPDATE ${sql.identifier([table])}
  SET ${sql.join(
    Object.entries(data as object).map(([key, value]) => sql`${sql.identifier([key])} = ${value}`),
    sql`, `,
  )}
  WHERE id = ${id}
  RETURNING *
  `);
  return result.rows[0];
}

export async function deleteCrudItem(
  db: DatabaseTransactionConnectionType,
  table: string,
  id: string,
): Promise<number> {
  const result = await db.query(sql`
  DELETE FROM ${sql.identifier([table])} WHERE id = ${id}
  `);
  return result.rowCount;
}
