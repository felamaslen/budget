import {
  sql,
  DatabaseTransactionConnectionType,
  ListSqlTokenType,
  UnnestSqlTokenType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';

import type { CrudItem } from './types';
import type { Create } from '~shared/types';

const whereId = (table: string, withUid: boolean, uid: number, id: number): ListSqlTokenType =>
  sql.join(
    [
      sql`${sql.identifier([table, 'id'])} = ${id}`,
      withUid && sql`${sql.identifier([table, 'uid'])} = ${uid}`,
    ].filter(Boolean),
    sql` AND `,
  );

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

const maybeRequireParent = <D extends CrudItem>(
  table: string,
  uid: number,
  parentTable: string | undefined,
  parentKey: keyof D | undefined,
  parentUid: boolean | undefined,
): TaggedTemplateLiteralInvocationType =>
  parentTable && parentKey
    ? sql`
      INNER JOIN ${sql.identifier([parentTable])} AS parent ON parent.id = ${sql.identifier([
        table,
        parentKey as string,
      ])} ${parentUid ? sql`AND parent.uid = ${uid} ` : sql``}
      `
    : sql``;

export async function selectCrudItem<D extends CrudItem>(
  withUid: boolean,
  parentTable: string | undefined,
  parentKey: keyof D | undefined,
  parentUid: boolean | undefined,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
  id: number,
): Promise<(D & { uid?: number }) | undefined> {
  const result = await db.query<D>(sql`
  SELECT ${sql.identifier([table])}.*
  FROM ${sql.identifier([table])}
  ${maybeRequireParent(table, uid, parentTable, parentKey, parentUid)}
  WHERE ${whereId(table, withUid, uid, id)}
  `);
  return result.rows[0];
}

export async function selectAllCrudItems<D extends CrudItem>(
  withUid: boolean,
  parentTable: string | undefined,
  parentKey: keyof D | undefined,
  parentUid: boolean | undefined,
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: string,
): Promise<readonly D[]> {
  const result = await db.query<D>(sql`
  SELECT ${sql.identifier([table])}.*
  FROM ${sql.identifier([table])}
  ${maybeRequireParent(table, uid, parentTable, parentKey, parentUid)}
  ${withUid ? sql`WHERE ${sql.identifier([table, 'uid'])} = ${uid}` : sql``}
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
  WHERE ${whereId(table, withUid, uid, id)}
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
  DELETE FROM ${sql.identifier([table])} WHERE ${whereId(table, withUid, uid, id)}
  `);
  return result.rowCount;
}
