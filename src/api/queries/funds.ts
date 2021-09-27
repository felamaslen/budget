import { omit, uniqBy } from 'lodash';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '~api/controllers/shared';
import { Fund, PageNonStandard, StockSplit, TargetDelta, Transaction } from '~api/types';
import { Create } from '~shared/types';

export type FundMain = Omit<Fund, 'transactions' | 'stockSplits'>;

export async function insertFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  fund: Create<FundMain>,
): Promise<number> {
  const { rows } = await db.query<{ id: number }>(sql`
  INSERT INTO ${sql.identifier([PageNonStandard.Funds])} (uid, item, allocation_target)
  VALUES (${uid}, ${fund.item}, ${fund.allocationTarget ?? null})
  RETURNING id
  `);
  return rows[0].id;
}

export async function updateFund(
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  fund: Create<FundMain>,
): Promise<void> {
  await db.query(sql`
  UPDATE ${sql.identifier([PageNonStandard.Funds])}
  SET item = ${fund.item}, allocation_target = ${fund.allocationTarget ?? null}
  WHERE uid = ${uid} and id = ${id}
  `);
}

export async function selectTransactions(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<readonly Transaction[]> {
  const result = await db.query<Transaction>(sql`
  SELECT date, units, price, fees, taxes, is_drip as drip
  FROM funds f
  INNER JOIN funds_transactions ft ON ft.fund_id = f.id
  WHERE f.uid = ${uid} AND ft.date <= ${now.toISOString()}
  ORDER BY ft.date
  `);
  return result.rows;
}

export async function upsertTransactions(
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
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
  if (!transactions.length) {
    return;
  }
  await db.query(sql`
  INSERT INTO funds_transactions (fund_id, date, units, price, fees, taxes, is_drip)
  SELECT * FROM ${sql.unnest(
    transactions.map(({ date, units, price, fees, taxes, drip }) => [
      id,
      formatDate(date),
      units,
      price,
      fees,
      taxes,
      drip,
    ]),
    ['int4', 'date', 'float8', 'float8', 'int4', 'int4', 'bool'],
  )}
  `);
}

export async function upsertStockSplits(
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
  stockSplits: StockSplit[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM funds_stock_splits
  USING funds
  WHERE ${sql.join(
    [sql`funds.uid = ${uid}`, sql`funds.id = ${id}`, sql`funds.id = funds_stock_splits.fund_id`],
    sql` AND `,
  )}
  `);
  if (!stockSplits.length) {
    return;
  }
  await db.query(sql`
  INSERT INTO funds_stock_splits (fund_id, date, ratio)
  SELECT * FROM ${sql.unnest(
    stockSplits.map(({ date, ratio }) => [id, formatDate(date), ratio]),
    ['int4', 'date', 'float8'],
  )}
  `);
}

export type FundListRow = {
  id: number;
  item: string;
  allocation_target: number | null;
};

type TransactionJoins = {
  transaction_ids: number[] | [null];
  transaction_dates: string[] | [null];
  transaction_units: number[] | [null];
  transaction_prices: number[] | [null];
  transaction_fees: number[] | [null];
  transaction_taxes: number[] | [null];
  transaction_drip: boolean[] | [null];
};

type StockSplitJoins = {
  stock_split_ids: number[] | [null];
  stock_split_dates: string[] | [null];
  stock_split_ratios: number[] | [null];
};

type JoinedFundRow = FundListRow & TransactionJoins & StockSplitJoins;

type JoinedFundRowWithTransactions = Omit<JoinedFundRow, keyof TransactionJoins> & {
  transaction_ids: number[];
  transaction_dates: string[];
  transaction_units: number[];
  transaction_prices: number[];
  transaction_fees: number[];
  transaction_taxes: number[];
  transaction_drip: boolean[];
};

type JoinedFundRowWithStockSplits = Omit<JoinedFundRow, keyof StockSplitJoins> & {
  stock_split_ids: number[];
  stock_split_dates: string[];
  stock_split_ratios: number[];
};

const hasTransactions = (row: JoinedFundRow): row is JoinedFundRowWithTransactions =>
  !!row.transaction_ids[0];

const hasStockSplits = (row: JoinedFundRow): row is JoinedFundRowWithStockSplits =>
  !!row.stock_split_ids[0];

export async function selectFundsItems(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<Fund[]> {
  const result = await db.query<JoinedFundRow>(sql`
  SELECT matching_funds.*, funds.item, funds.allocation_target
  FROM (
    SELECT ${sql.join(
      [
        sql`funds.id`,
        sql`array_agg(transactions.id ORDER BY transactions.date DESC) as transaction_ids`,
        sql`array_agg(transactions.date ORDER BY transactions.date DESC) as transaction_dates`,
        sql`array_agg(transactions.units ORDER BY transactions.date DESC) as transaction_units`,
        sql`array_agg(transactions.price ORDER BY transactions.date DESC) as transaction_prices`,
        sql`array_agg(transactions.fees ORDER BY transactions.date DESC) as transaction_fees`,
        sql`array_agg(transactions.taxes ORDER BY transactions.date DESC) as transaction_taxes`,
        sql`array_agg(transactions.is_drip ORDER BY transactions.date DESC) as transaction_drip`,
        sql`array_agg(stock_splits.id ORDER BY stock_splits.date ASC) as stock_split_ids`,
        sql`array_agg(stock_splits.date ORDER BY stock_splits.date ASC) as stock_split_dates`,
        sql`array_agg(stock_splits.ratio ORDER BY stock_splits.date ASC) as stock_split_ratios`,
      ],
      sql`, `,
    )}
    FROM funds
    LEFT JOIN funds_transactions transactions ON transactions.fund_id = funds.id
    LEFT JOIN funds_stock_splits stock_splits ON stock_splits.fund_id = funds.id
    WHERE funds.uid = ${uid}
    GROUP BY funds.id
  ) matching_funds
  INNER JOIN funds ON funds.id = matching_funds.id
  ORDER BY matching_funds.id
  `);

  return result.rows.map<Fund>((row) => ({
    id: row.id,
    item: row.item,
    allocationTarget: row.allocation_target,
    transactions: hasTransactions(row)
      ? uniqBy(
          row.transaction_ids.map<Transaction & { id: number }>((id, index) => ({
            id,
            date: new Date(row.transaction_dates[index]),
            units: row.transaction_units[index],
            price: row.transaction_prices[index],
            fees: row.transaction_fees[index],
            taxes: row.transaction_taxes[index],
            drip: row.transaction_drip[index],
          })),
          'id',
        ).map((tr) => omit(tr, 'id'))
      : [],
    stockSplits: hasStockSplits(row)
      ? uniqBy(
          row.stock_split_ids.map<StockSplit & { id: number }>((id, index) => ({
            id,
            date: new Date(row.stock_split_dates[index]),
            ratio: row.stock_split_ratios[index],
          })),
          'id',
        ).map((tr) => omit(tr, 'id'))
      : [],
  }));
}

export async function selectFundHistoryNumResults(
  db: DatabaseTransactionConnectionType,
  uid: number,
  minTime: Date,
): Promise<number> {
  const result = await db.query<{ count: number }>(sql`
  SELECT COUNT(1)::integer AS count
  FROM (
    SELECT fct.cid
    FROM funds f
    INNER JOIN fund_scrape fs ON fs.item = f.item
    INNER JOIN fund_cache fc ON fc.fid = fs.fid
    INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
    WHERE ${sql.join([sql`f.uid = ${uid}`, sql`fct.time > ${minTime.toISOString()}`], sql` AND `)}
    GROUP BY fct.cid
  ) results
  `);
  return result.rows[0].count;
}

export type FundHistoryRow = { time: number; id: number[]; price: number[] };

export async function selectFundHistory(
  db: DatabaseTransactionConnectionType,
  uid: number,
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
          sql`array_agg(COALESCE(fc.price, 0) ORDER BY funds.date DESC) AS price`,
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
      INNER JOIN fund_scrape fs ON fs.item = funds.item
      INNER JOIN fund_cache fc ON fc.fid = fs.fid
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

export type FundHistoryIndividualRow = { date: Date; price: number };

export async function selectIndividualFullFundHistory(
  db: DatabaseTransactionConnectionType,
  uid: number,
  id: number,
): Promise<readonly FundHistoryIndividualRow[]> {
  const results = await db.query<FundHistoryIndividualRow>(sql`
  SELECT fct.time AS date, fc.price
  FROM funds f
  INNER JOIN fund_scrape fs ON fs.item = f.item
  INNER JOIN fund_cache fc ON fc.fid = fs.fid
  INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
  WHERE f.id = ${id} AND f.uid = ${uid}
  ORDER BY fct.time
  `);
  return results.rows;
}

export async function selectCashTarget(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<number> {
  const result = await db.query<{ allocation_target: number }>(sql`
  SELECT allocation_target
  FROM funds_cash_target
  WHERE uid = ${uid}
  `);
  return result.rows[0]?.allocation_target ?? 0;
}

export async function upsertCashTarget(
  db: DatabaseTransactionConnectionType,
  uid: number,
  cashTarget: number,
): Promise<number> {
  const result = await db.query<{ allocation_target: number }>(sql`
  INSERT INTO funds_cash_target (uid, allocation_target)
  VALUES (${uid}, ${cashTarget})
  ON CONFLICT (uid) DO UPDATE SET allocation_target = excluded.allocation_target
  RETURNING allocation_target
  `);
  return result.rows[0].allocation_target;
}

export async function selectAllocationTargetSum(
  db: DatabaseTransactionConnectionType,
  uid: number,
  excludeIds: number[] = [],
): Promise<number> {
  const result = await db.query<{ sum: number }>(sql`
  SELECT SUM(COALESCE(allocation_target, 0)) AS sum FROM funds
  WHERE uid = ${uid} AND NOT (id = ANY(${sql.array(excludeIds, 'int4')}))
  `);
  return result.rows[0].sum;
}

export async function updateAllocationTarget(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id, allocationTarget }: TargetDelta,
): Promise<{ id: number; allocation_target: number } | undefined> {
  const result = await db.query<{ id: number; allocation_target: number }>(sql`
  UPDATE funds SET allocation_target = ${allocationTarget}
  WHERE uid = ${uid} AND id = ${id}
  RETURNING id, allocation_target
  `);
  return result.rows[0];
}

type FundByName = {
  id: number;
  uid: number;
  item: string;
};

export async function selectPreviousItem(
  db: DatabaseTransactionConnectionType,
  id: number,
): Promise<string | undefined> {
  const previousItem = await db.query<{ item: string }>(sql`
  SELECT item FROM funds WHERE id = ${id}
  `);
  return previousItem.rows[0]?.item;
}

export async function selectFundsByName(
  db: DatabaseTransactionConnectionType,
  id: number,
): Promise<readonly FundByName[]> {
  const fundsByName = await db.query<FundByName>(sql`
  SELECT f1.id, f1.uid, f1.item
  FROM funds f0
  LEFT JOIN funds f1 ON f1.item = f0.item
  WHERE f0.id = ${id}
  `);
  return fundsByName.rows;
}

export async function updateFundCacheItemReference(
  db: DatabaseTransactionConnectionType,
  item: string,
  previousItem: string,
): Promise<void> {
  await db.query(sql`
  UPDATE fund_scrape
  SET item = ${item}
  WHERE item = ${previousItem}
  `);
}
