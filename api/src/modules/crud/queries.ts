import {
  sql,
  DatabaseTransactionConnectionType,
  ListSqlTokenType,
  UnnestSqlTokenType,
} from 'slonik';

import { CrudItem } from './types';
import { Create } from '~api/types';

const whereId = (withUid: boolean, uid: number, id: number): ListSqlTokenType =>
  sql.join([sql`id = ${id}`, withUid && sql`uid = ${uid}`].filter(Boolean), sql` AND `);

const filterRowProps = <R extends Record<string, UnnestSqlTokenType | undefined>>(
  row: R,
): [string, UnnestSqlTokenType][] =>
  Object.entries(row).filter(
    (entry): entry is [string, UnnestSqlTokenType] => typeof entry[1] !== 'undefined',
  );

export async function insertCrudItem<D extends CrudItem>(
  withUid: boolean,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
  row: Create<D>,
): Promise<D> {
  const result = await db.query<D & { id: number }>(sql`
  INSERT INTO ${sql.identifier([table])}
  (${sql.join(
    filterRowProps(row).reduce(
      (last, [column]) => [...last, sql.identifier([column])],
      withUid ? [sql.identifier(['uid'])] : [],
    ),
    sql`, `,
  )})
  VALUES (
    ${sql.join(
      filterRowProps(row).reduce(
        (last, [, value]) => [...last, sql`${value}`],
        withUid ? [sql`${uid}`] : [],
      ),
      sql`, `,
    )}
  )
  RETURNING *
  `);
  return result.rows[0];
}

export async function selectCrudItem<D extends CrudItem>(
  withUid: boolean,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
  id: number,
): Promise<(D & { uid?: number }) | undefined> {
  const result = await db.query<D>(sql`
  SELECT * FROM ${sql.identifier([table])} WHERE ${whereId(withUid, uid, id)}
  `);
  return result.rows[0];
}

export async function selectAllCrudItems<D extends CrudItem>(
  withUid: boolean,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
): Promise<readonly D[]> {
  const result = await db.query<D>(sql`
  SELECT * FROM ${sql.identifier([table])}
  ${withUid ? sql`WHERE uid = ${uid}` : sql``}
  `);
  return result.rows;
}

export async function updateCrudItem<D extends CrudItem>(
  withUid: boolean,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
  id: number,
  data: Create<D>,
): Promise<D | undefined> {
  const result = await db.query<D>(sql`
  UPDATE ${sql.identifier([table])}
  SET ${sql.join(
    filterRowProps(data).map(([key, value]) => sql`${sql.identifier([key])} = ${value}`),
    sql`, `,
  )}
  WHERE ${whereId(withUid, uid, id)}
  RETURNING *
  `);
  return result.rows[0];
}

export async function deleteCrudItem(
  withUid: boolean,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
  id: number,
): Promise<number> {
  const result = await db.query(sql`
  DELETE FROM ${sql.identifier([table])} WHERE ${whereId(withUid, uid, id)}
  `);
  return result.rowCount;
}
