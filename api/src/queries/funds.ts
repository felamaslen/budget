import { sql, DatabaseTransactionConnectionType } from 'slonik';
import { Transaction, Fund } from '~api/types';

export async function selectTransactions(
  db: DatabaseTransactionConnectionType,
  uid: string,
  now: Date,
): Promise<readonly Transaction[]> {
  const result = await db.query<Transaction>(sql`
  SELECT ft.*
  FROM funds f
  INNER JOIN funds_transactions ft ON ft.fund_id = f.id
  WHERE f.uid = ${uid} AND ft.date <= ${now.toISOString()}
  ORDER BY ft.date
  `);
  return result.rows;
}

export async function upsertTransactions(
  db: DatabaseTransactionConnectionType,
  uid: string,
  id: string,
  transactions: Transaction[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM funds_transactions
  USING funds
  WHERE ${sql.join(
    [sql`funds.uid = ${uid}`, sql`funds.id = ${id}`, sql`funds.id = funds_transactions.fund_id`],
    sql` AND `,
  )}
  `);
  await db.query(sql`
  INSERT INTO funds_transactions (fund_id, date, units, cost)
  SELECT * FROM ${sql.unnest(
    transactions.map(({ date, units, cost }) => [id, date, units, cost]),
    ['uuid', 'date', 'float8', 'int4'],
  )}
  `);
}

type RowWithTransactions = {
  id: string;
  item: string;
  dates: string[];
  units: number[];
  costs: number[];
};

export async function getFundsItems(
  db: DatabaseTransactionConnectionType,
  uid: string,
): Promise<Fund[]> {
  const result = await db.query<RowWithTransactions>(sql`
  SELECT ${sql.join(
    [
      sql.identifier(['funds', 'id']),
      sql.identifier(['funds', 'item']),
      sql`array_agg(transactions.date ORDER BY transactions.date DESC) as dates`,
      sql`array_agg(transactions.units ORDER BY transactions.date DESC) as units`,
      sql`array_agg(transactions.cost ORDER BY transactions.date DESC) as costs`,
    ],
    sql`, `,
  )}
  FROM funds
  LEFT JOIN funds_transactions transactions ON transactions.fund_id = funds.id
  WHERE funds.uid = ${uid}
  GROUP BY funds.id
  ORDER BY funds.id
  `);

  return result.rows.map(({ id, item, dates, units, costs }) => ({
    id,
    item,
    transactions: dates.filter(Boolean).map((date, index) => ({
      date,
      units: units[index],
      cost: costs[index],
    })),
  }));
}

export async function getFundHistoryNumResults(
  db: DatabaseTransactionConnectionType,
  uid: string,
  salt: string,
  minTime: Date,
): Promise<number> {
  const result = await db.query<{ count: number }>(sql`
  SELECT COUNT(1)::integer AS count
  FROM (
    SELECT fct.cid
    FROM funds f
    INNER JOIN fund_hash fh ON fh.hash = md5(f.item || ${salt})
    INNER JOIN fund_cache fc ON fc.fid = fh.fid
    INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
    WHERE ${sql.join([sql`f.uid = ${uid}`, sql`fct.time > ${minTime.toISOString()}`], sql` AND `)}
    GROUP BY fct.cid
  ) results
  `);
  return result.rows[0].count;
}

export type FundHistoryRow = { time: number; id: string[]; price: number[] };

export async function getFundHistory(
  db: DatabaseTransactionConnectionType,
  uid: string,
  salt: string,
  numResults: number,
  numToDisplay: number,
  minTime: Date,
): Promise<readonly FundHistoryRow[]> {
  const results = await db.query<FundHistoryRow>(sql`
  SELECT id, time, price
  FROM (
    SELECT ${sql.join(
      [
        sql`id`,
        sql`time`,
        sql`price`,
        sql`row_num`,
        sql`floor(row_num % ${Math.ceil(numResults / numToDisplay)}) AS period`,
      ],
      sql`, `,
    )}
    FROM (
      SELECT ${sql.join(
        [
          sql`fct.cid`,
          sql`fct.time`,
          sql`array_agg(funds.id ORDER BY funds.date DESC) AS id`,
          sql`array_agg(fc.price ORDER BY funds.date DESC) AS price`,
          sql`row_number() OVER (ORDER BY time) AS row_num`,
        ],
        sql`, `,
      )}
      FROM (
        SELECT DISTINCT f.id, f.item, min(ft.date) AS date
        FROM funds f
        INNER JOIN funds_transactions ft ON ft.fund_id = f.id
        WHERE f.uid = ${uid}
        GROUP BY f.id
      ) funds
      INNER JOIN fund_hash fh ON fh.hash = md5(funds.item || ${salt})
      INNER JOIN fund_cache fc ON fc.fid = fh.fid
      INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
      WHERE fct.time > ${minTime.toISOString()}
      GROUP BY fct.cid
      ORDER BY fct.time
    ) prices
  ) results
  WHERE ${sql.join(
    [
      sql`period = 0`,
      sql`row_num = ${numResults}`,
      sql`row_num = ${numResults - 1}`,
      sql`row_num = 1`,
    ],
    sql` OR `,
  )}
  `);
  return results.rows.map(({ id, time, price }) => ({ id, time, price }));
}
