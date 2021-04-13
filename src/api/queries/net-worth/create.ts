import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { Item, ValueRow, FXValueRow, OptionValueRow, LoanValueRow } from '~api/types';

export async function insertEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  date: string,
): Promise<number> {
  const {
    rows: [{ id }],
  } = await db.query<Item>(sql`
    INSERT INTO net_worth (uid, date)
    VALUES (${uid}, ${date})
    RETURNING id
  `);
  return id;
}

export async function insertValues(
  db: DatabaseTransactionConnectionType,
  valuesRows: ValueRow[],
): Promise<number[]> {
  const { rows } = await db.query<Item>(sql`
    INSERT INTO net_worth_values (net_worth_id, skip, subcategory, value)
    SELECT * FROM ${sql.unnest(valuesRows, ['int4', 'bool', 'int4', 'int4'])}
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
  fxValuesRows: FXValueRow[],
): Promise<void> {
  if (!fxValuesRows.length) {
    return;
  }
  await db.query(sql`
    INSERT INTO net_worth_fx_values (values_id, value, currency)
    SELECT * FROM ${sql.unnest(fxValuesRows, ['int4', 'float4', 'varchar'])}
    ON CONFLICT (values_id, currency)
      DO UPDATE SET value = excluded.value
  `);
}

export async function insertOptionValues(
  db: DatabaseTransactionConnectionType,
  optionValuesRows: OptionValueRow[],
): Promise<void> {
  if (!optionValuesRows.length) {
    return;
  }
  await db.query(sql`
    INSERT INTO net_worth_option_values (values_id, units, strike_price, market_price, vested)
    SELECT * FROM ${sql.unnest(optionValuesRows, ['int4', 'float4', 'float4', 'float4', 'int4'])}
  `);
}

export async function insertLoanValues(
  db: DatabaseTransactionConnectionType,
  loanValuesRows: LoanValueRow[],
): Promise<void> {
  if (!loanValuesRows.length) {
    return;
  }
  await db.query(sql`
    INSERT INTO net_worth_loan_values (values_id, payments_remaining, rate)
    SELECT * FROM ${sql.unnest(loanValuesRows, ['int4', 'int4', 'float4'])}
  `);
}

export async function insertWithNetWorthId<R extends Record<string, unknown>>(
  db: DatabaseTransactionConnectionType,
  table: string,
  keys: [keyof R, keyof R],
  types: string[],
  netWorthId: number,
  rows: R[] = [],
): Promise<void> {
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
    SELECT * FROM ${sql.unnest(rowsWithId, ['int4', ...types])}
    ON CONFLICT (net_worth_id, ${sql.identifier([keys[0] as string])})
      DO UPDATE SET
        ${sql.identifier([keys[1] as string])} =
        ${sql.identifier(['excluded', keys[1] as string])}
  `);
}
