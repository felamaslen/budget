import { sql, DatabaseTransactionConnectionType } from 'slonik';
import {
  ListCategory,
  ListCalcCategory,
  ListItem,
  ListCalcItem,
  CreateList,
  UpdateList,
} from '~api/types';

export async function countRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
): Promise<number> {
  const {
    rows: [{ count }],
  } = await db.query<{ count: number }>(sql`
  SELECT COUNT(*) AS count
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid}
  `);
  return count;
}

export async function getListTotalCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCalcCategory,
): Promise<number> {
  const {
    rows: [{ total }],
  } = await db.query<{ total: number }>(sql`
  SELECT SUM(cost) AS total
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid}
  `);
  return total;
}

export async function getListWeeklyCosts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCalcCategory,
): Promise<number[]> {
  const results = await db.query<{ year_weekly_cost: number }>(sql`
  SELECT SUM(cost) / MAX(week) AS year_weekly_cost
  FROM (
    SELECT cost, date_part('year', date) AS year, date_part('week', date) AS week
    FROM ${sql.identifier([table])}
    WHERE uid = ${uid}
  ) costs
  GROUP BY year
  ORDER BY year
  `);
  return results.rows.map(({ year_weekly_cost }) => year_weekly_cost);
}

export async function validateId(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
  id: number,
): Promise<boolean> {
  const {
    rows: [{ count }],
  } = await db.query<{ count: number }>(sql`
  SELECT COUNT(*) AS count
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid} AND id = ${id}
  `);
  return count === 1;
}

export async function insertListItem<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
  item: CreateList<I>,
): Promise<number> {
  const {
    rows: [{ id }],
  } = await db.query<{ id: number }>(sql`
  INSERT INTO ${sql.identifier([table])}
    (uid, ${sql.join(
      Object.keys(item).map((column) => sql.identifier([column])),
      sql`, `,
    )})
  VALUES
    (
      ${uid},
      ${sql.join(
        Object.values(item).map((value) => sql`${value}`),
        sql`, `,
      )}
    )
  RETURNING id
  `);
  return id;
}

export async function getListItems<I extends ListCalcItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCalcCategory,
  columns: (keyof I)[],
  limit: number,
  offset: number,
): Promise<readonly I[]> {
  const { rows } = await db.query<I>(sql`
  SELECT ${sql.join(
    columns.map((column) => sql.identifier([table, column as string])),
    sql`, `,
  )}
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid}
  ORDER BY date DESC, id ASC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  `);
  return rows;
}

export async function updateListItem<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
  item: UpdateList<I>,
): Promise<void> {
  await db.query(sql`
  UPDATE ${sql.identifier([table])}
  SET ${sql.join(
    Object.entries(item)
      .filter(([column]) => column !== 'id')
      .map(
        ([column, value]) =>
          sql`${sql.identifier([column])} = ${value ?? sql.identifier([table, column])}`,
      ),
    sql`, `,
  )}
  WHERE uid = ${uid} AND id = ${item.id}
  `);
}

export async function deleteListItem(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCategory,
  id: number,
): Promise<void> {
  await db.query(sql`
  DELETE FROM ${sql.identifier([table])}
  WHERE uid = ${uid} AND id = ${id}
  `);
}
