import { sql, DatabaseTransactionConnectionType, ListSqlTokenType } from 'slonik';
import { Create, ListItem, ListItemInput, PageListCost, RawDate, TypeMap } from '~api/types';

export async function countRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
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

export async function selectListTotalCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
): Promise<number> {
  const { rows } = await db.query<{ total: number }>(sql`
  SELECT COALESCE(SUM(cost), 0) AS total
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid}
  `);
  return rows[0].total;
}

export async function selectListWeeklyCosts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
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

type TypeMapEntry<I extends ListItemInput> = [keyof Create<I>, string];

const getTypes = <I extends ListItemInput>(typeMap: TypeMap<I>): TypeMapEntry<I>[] =>
  Object.entries(typeMap) as TypeMapEntry<I>[];

const getDbColumns = <I extends ListItemInput>(
  types: TypeMapEntry<I>[],
  columnMap?: Partial<TypeMap<I>>,
): string[] => types.map(([column]) => columnMap?.[column] ?? (column as string));

const getColumnList = <I extends ListItemInput>(
  types: TypeMapEntry<I>[],
  columnMap?: TypeMap<I>,
): ListSqlTokenType =>
  sql.join(
    getDbColumns(types, columnMap).map((dbColumn) => sql.identifier([dbColumn])),
    sql`, `,
  );

const getHumanColumnList = <I extends ListItemInput>(
  types: TypeMapEntry<I>[],
  columnMap: Partial<TypeMap<I>>,
): ListSqlTokenType =>
  sql.join(
    getDbColumns(types, columnMap).map(
      (dbColumn, index) =>
        sql`${sql.identifier([dbColumn])} AS ${sql.identifier([types[index][0] as string])}`,
    ),
    sql`, `,
  );

export async function insertListItems<I extends ListItemInput>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
  typeMap: TypeMap<RawDate<I>>,
  items: RawDate<I>[],
  columnMap?: TypeMap<RawDate<I>>,
): Promise<number[]> {
  const types = getTypes(typeMap);
  const columnList = getColumnList(types, columnMap);

  const result = await db.query<{ id: number }>(sql`
  INSERT INTO ${sql.identifier([table])}
    (uid, ${columnList})
  SELECT * FROM ${sql.unnest(
    items.map((item) => [uid, ...types.map(([column]) => item[column])]),
    ['int4', ...types.map(([, type]) => type)],
  )}
  RETURNING id
  `);
  return result.rows.map<number>((row) => row.id);
}

export async function selectListItems<I extends ListItem>(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
  typeMap: TypeMap<RawDate<I>>,
  limit: number,
  offset: number,
): Promise<readonly I[]> {
  const { rows } = await db.query<I>(sql`
  SELECT id, ${getHumanColumnList(getTypes(typeMap), {})}
  FROM ${sql.identifier([table])}
  WHERE uid = ${uid}
  ORDER BY date DESC, id ASC
  LIMIT ${limit}
  OFFSET ${offset * limit}
  `);
  return rows;
}

export async function deleteListItem(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: PageListCost,
  id: number,
): Promise<void> {
  await db.query(sql`
  DELETE FROM ${sql.identifier([table])}
  WHERE uid = ${uid} AND id = ${id}
  `);
}
