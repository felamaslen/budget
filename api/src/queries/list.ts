import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType } from 'slonik';
import {
  ListCategory,
  ListCalcCategory,
  ListItem,
  ListCalcItem,
  CreateList,
  UpdateList,
} from '~api/types';

export async function countOldRows(
  db: DatabaseTransactionConnectionType,
  uid: string,
  table: ListCategory,
  startDate: Date,
): Promise<number> {
  const {
    rows: [{ count }],
  } = await db.query<{ count: number }>(sql`
  SELECT COUNT(*) AS count
  FROM ${sql.identifier([table])}
  WHERE ${sql.join([sql`date < ${format(startDate, 'yyyy-MM-dd')}`, sql`uid = ${uid}`], sql` AND `)}
  `);
  return count;
}

export async function getListTotalCost(
  db: DatabaseTransactionConnectionType,
  uid: string,
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
  uid: string,
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
  uid: string,
  table: ListCategory,
  id: string,
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
  uid: string,
  table: ListCategory,
  item: CreateList<I>,
): Promise<string> {
  const {
    rows: [{ id }],
  } = await db.query<{ id: string }>(sql`
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
  uid: string,
  table: ListCalcCategory,
  columns: (keyof I)[],
  startDate: Date,
  endDate: Date | null,
): Promise<readonly I[]> {
  const { rows } = await db.query<I>(sql`
  SELECT ${sql.join(
    columns.map((column) => sql.identifier([table, column as string])),
    sql`, `,
  )}
  FROM ${sql.identifier([table])}
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`date >= ${format(startDate, 'yyyy-MM-dd')}`,
      endDate && sql`date <= ${format(endDate, 'yyyy-MM-dd')}`,
    ].filter(Boolean),
    sql` AND `,
  )}
  ORDER BY date DESC, id ASC
  `);
  return rows;
}

export async function updateListItem<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: string,
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
  uid: string,
  table: ListCategory,
  id: string,
): Promise<void> {
  await db.query(sql`
  DELETE FROM ${sql.identifier([table])}
  WHERE uid = ${uid} AND id = ${id}
  `);
}
