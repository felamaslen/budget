import { sql, DatabaseTransactionConnectionType } from 'slonik';

export async function deleteOldValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  subcategories: number[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_values nwv
    USING net_worth nw
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwv.net_worth_id = nw.id`,
        sql`nwv.subcategory = ANY(${sql.array(subcategories, 'int4')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteOldCreditLimit(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  subcategories: number[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_credit_limit nwcl
    USING net_worth nw
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwcl.net_worth_id = nw.id`,
        sql`nwcl.subcategory = ANY(${sql.array(subcategories, 'int4')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteOldCurrencies(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  currencies: string[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_currencies nwc
    USING net_worth nw
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwc.net_worth_id = nw.id`,
        sql`nwc.currency = ANY(${sql.array(currencies, 'text')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteChangedFXValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  subcategories: number[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_fx_values nwfxv
    USING net_worth nw, net_worth_values nwv
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwv.net_worth_id = nw.id`,
        sql`nwfxv.values_id = nwv.id`,
        sql`nwv.subcategory = ANY(${sql.array(subcategories, 'int4')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteChangedOptionValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  subcategories: number[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_option_values nwopv
    USING net_worth nw, net_worth_values nwv
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwv.net_worth_id = nw.id`,
        sql`nwopv.values_id = nwv.id`,
        sql`nwv.subcategory = ANY(${sql.array(subcategories, 'int4')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteChangedMortgageValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  subcategories: number[],
): Promise<void> {
  await db.query(sql`
    DELETE FROM net_worth_mortgage_values nwmv
    USING net_worth nw, net_worth_values nwv
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.id = ${netWorthId}`,
        sql`nwv.net_worth_id = nw.id`,
        sql`nwmv.values_id = nwv.id`,
        sql`nwv.subcategory = ANY(${sql.array(subcategories, 'int4')})`,
      ],
      sql` AND `,
    )}
  `);
}

export async function deleteNetWorthEntryRow(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<number> {
  const result = await db.query(sql`
  DELETE FROM net_worth
  WHERE uid = ${uid} AND id = ${netWorthId}
  RETURNING *
  `);
  return result.rowCount;
}
