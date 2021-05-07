import { sql, DatabaseTransactionConnectionType } from 'slonik';
import { StockCodes, Stock } from './types';

type FundRow = {
  uid: number;
  name: string;
  units: number;
  cost: number;
};

export async function selectFunds(
  db: DatabaseTransactionConnectionType,
): Promise<readonly FundRow[]> {
  const { rows } = await db.query<FundRow>(sql`
  SELECT uid, item as name, units, cost
  FROM (
    SELECT ${sql.join(
      [
        sql`f.uid`,
        sql`f.item`,
        sql`ROUND(SUM(ft.units)::decimal, 5) AS units`,
        sql`SUM(ft.units * ft.price + ft.fees + ft.taxes)::float AS cost`,
      ],
      sql`, `,
    )}
    FROM funds f
    INNER JOIN funds_transactions ft ON ft.fund_id = f.id
    GROUP BY f.uid, f.item
  ) r
  WHERE r.units > 0
  ORDER BY r.uid, r.item
  `);
  return rows;
}

type StockCodeRow = {
  name: string;
  code: string;
};

export async function selectStockCodes(
  db: DatabaseTransactionConnectionType,
): Promise<readonly StockCodeRow[]> {
  const { rows } = await db.query<StockCodeRow>(sql`
  SELECT name, code FROM stock_codes
  `);
  return rows;
}

export async function insertStockCodes(
  db: DatabaseTransactionConnectionType,
  stockCodes: StockCodes,
): Promise<void> {
  await db.query(sql`
  INSERT INTO stock_codes (name, code)
  SELECT * FROM ${sql.unnest(
    Object.entries(stockCodes).map(([name, code]) => [name, code]),
    ['text', 'text'],
  )}
  `);
}

export async function cleanStocksList(db: DatabaseTransactionConnectionType): Promise<void> {
  await db.query(sql`TRUNCATE TABLE stocks`);
}

export async function insertStocksList(
  db: DatabaseTransactionConnectionType,
  stocksList: Stock[],
): Promise<void> {
  const tuples = stocksList.map(({ uid, name, code, weight, subweight }) => [
    uid,
    name,
    code,
    weight,
    subweight,
  ]);
  await db.query(sql`
  INSERT INTO stocks (uid, name, code, weight, subweight)
  SELECT * FROM ${sql.unnest(tuples, ['int4', 'text', 'text', 'float8', 'float8'])}
  `);
}

export async function upsertFundHashes(
  db: DatabaseTransactionConnectionType,
  tuples: [string, string][], // hash, broker
): Promise<number[]> {
  const result = await db.query<{ fid: number }>(sql`
  INSERT INTO fund_scrape (item, broker)
  SELECT * FROM ${sql.unnest(tuples, ['text', 'text'])}
  ON CONFLICT (item, broker) DO UPDATE
    SET item = excluded.item
  RETURNING fid
  `);
  return result.rows.map(({ fid }) => fid);
}

export async function insertPrices(
  db: DatabaseTransactionConnectionType,
  tuples: [number, number, number][], // cid, fid, price
): Promise<void> {
  await db.query(sql`
  INSERT INTO fund_cache (cid, fid, price)
  SELECT * FROM ${sql.unnest(tuples, ['int4', 'int4', 'float8'])}
  `);
}

export async function insertPriceCache(
  db: DatabaseTransactionConnectionType,
  now: Date,
): Promise<number> {
  const result = await db.query<{ cid: number }>(sql`
  INSERT INTO fund_cache_time (time)
  VALUES (${now.toISOString()})
  RETURNING cid
  `);
  return result.rows[0].cid;
}
