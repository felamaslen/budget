import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { IDRow } from '~api/types';

export async function insertEntry(
  db: DatabaseTransactionConnectionType,
  uid: string,
  date: string,
): Promise<string> {
  const {
    rows: [{ id }],
  } = await db.query<IDRow>(sql`
    INSERT INTO net_worth (uid, date)
    VALUES (${uid}, ${date})
    RETURNING id
  `);
  return id;
}

export async function insertValues(
  db: DatabaseTransactionConnectionType,
  valuesRows: [string, boolean | null, string, number | null][],
): Promise<string[]> {
  const { rows } = await db.query<IDRow>(sql`
    INSERT INTO net_worth_values (net_worth_id, skip, subcategory, value)
    SELECT * FROM ${sql.unnest(valuesRows, ['uuid', 'bool', 'uuid', 'int4'])}
    ON CONFLICT (net_worth_id, subcategory) DO UPDATE SET ${sql.join(
      [sql`skip = excluded.skip`, sql`value = excluded.value`],
      sql`, `,
    )}
    RETURNING id
  `);
  return rows.map(({ id }) => id);
}

export async function insertFXValues(
  db: DatabaseTransactionConnectionType,
  fxValuesRows: [string, number, string][],
): Promise<void> {
  if (!fxValuesRows.length) {
    return;
  }
  await db.query(sql`
    INSERT INTO net_worth_fx_values (values_id, value, currency)
    SELECT * FROM ${sql.unnest(fxValuesRows, ['uuid', 'float4', 'varchar'])}
    ON CONFLICT (values_id, currency)
      DO UPDATE SET value = excluded.value
  `);
}

export async function insertOptionValues(
  db: DatabaseTransactionConnectionType,
  optionValuesRows: [string, number, number, number][],
): Promise<void> {
  if (!optionValuesRows.length) {
    return;
  }
  await db.query(sql`
    INSERT INTO net_worth_option_values (values_id, units, strike_price, market_price)
    SELECT * FROM ${sql.unnest(optionValuesRows, ['uuid', 'float4', 'float4', 'float4'])}
  `);
}

export const insertWithNetWorthId = <R extends {}>(
  table: string,
  keys: [keyof R, keyof R],
  types: string[],
) => async (
  db: DatabaseTransactionConnectionType,
  netWorthId: string,
  rows: R[] = [],
): Promise<void> => {
  if (!rows.length) {
    return;
  }

  const rowsWithId = rows.map((row) => [netWorthId, ...keys.map((key) => row[key])]);

  const columns = [
    sql.identifier(['net_worth_id']),
    ...keys.map((key) => sql.identifier([key as string])),
  ];

  await db.query(sql`
    INSERT INTO ${sql.identifier([table])} (${sql.join(columns, sql`, `)})
    SELECT * FROM ${sql.unnest(rowsWithId, ['uuid', ...types])}
    ON CONFLICT (net_worth_id, ${sql.identifier([keys[0] as string])})
      DO UPDATE SET
        ${sql.identifier([keys[1] as string])} =
        ${sql.identifier(['excluded', keys[1] as string])}
  `);
};
