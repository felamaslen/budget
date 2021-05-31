import path from 'path';
import { compose } from '@typed/compose';
import parse from 'csv-parse/lib/sync';
import { addMonths, formatISO, setDay, startOfMonth } from 'date-fns';
import fs from 'fs-extra';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

import { getPool, withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';
import { FundListRow } from '~api/queries';
import { ListItemStandard, PageListStandard, Transaction } from '~api/types';
import type { RawDate } from '~shared/types';

const now = new Date();
const monthStart = startOfMonth(now);

async function readTableFromCsv<R extends Record<string, unknown>>(
  tableName: string,
): Promise<R[]> {
  const csvFile = path.resolve(__dirname, '../../../../resources/stage-data', `${tableName}.csv`);
  const parsed = parse(await fs.readFile(csvFile), { columns: true });
  return parsed;
}

const mapUids = <R extends Record<string, unknown>>(uid: number) => (
  row: R,
): R & { uid: number } => ({ ...row, uid });

function mapDates<R extends { date: string }>({ date, ...row }: R): R {
  const [, monthDelta, , dayOfMonth] = (date as string).match(
    /^((-|\+)\d+)((-|\+)\d+)$/,
  ) as RegExpMatchArray;
  return {
    ...row,
    date: formatISO(setDay(addMonths(monthStart, Number(monthDelta)), Number(dayOfMonth)), {
      representation: 'date',
    }),
  } as R;
}

const mapDatesWithUids = <R extends { date: string }>(
  uid: number,
): ((row: R) => R & { uid: number }) => compose(mapDates, mapUids(uid));

const removeColumn = <K extends string>(key: K) => <R extends { [key in K]: unknown }>({
  [key]: discard,
  ...row
}: R): Omit<R, K> => row;

const removeId = removeColumn('id');

const nullableKey = <K extends string, V extends string | number>(key: K) => <
  R extends { [key in K]: V | 'null' }
>(
  row: R,
): Omit<R, K> & { [key in K]: R[K] | null } => ({
  ...row,
  [key]: row[key] === 'null' ? null : row[key],
});

const nullableBool = <K extends string, R extends { [key in K]: 'true' | 'false' | 'null' }>(
  key: K,
) => (row: R): Omit<R, K> & { [key in K]: boolean | null } => ({
  ...row,
  [key]: row[key] === 'null' ? null : row[key] === 'true',
});

const mapForeignId = <
  ParentKey extends string,
  ForeignKey extends string,
  Parent extends { [key in ParentKey]: number },
  Child extends { [key in ForeignKey]: number }
>(
  parentsRaw: Parent[],
  parentIdRows: readonly { [key in ParentKey]: number }[],
  parentKey: ParentKey,
  foreignKey: ForeignKey,
) => (child: Child): Child => ({
  ...child,
  [foreignKey]:
    parentIdRows[
      parentsRaw.findIndex((parent) => (parent[parentKey] as number) === child[foreignKey])
    ][parentKey],
});

const insertStandardListFromCsv = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListStandard,
): Promise<void> => {
  logger.info(`[seed] creating ${page} data`);

  await db.query(sql`DELETE FROM list_standard WHERE page = ${page} AND uid = ${uid}`);

  const rows = await readTableFromCsv<RawDate<ListItemStandard, 'date'>>(page);

  await db.query(sql`
  INSERT INTO list_standard (page, uid, date, item, category, value, shop)
  SELECT * FROM ${sql.unnest(
    rows
      .map(mapDates)
      .map((row) => [page, uid, row.date, row.item, row.category, row.cost, row.shop]),
    ['page_category', 'int4', 'date', 'text', 'text', 'int4', 'text'],
  )}
  `);
};

const seedStandardList = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<void> => {
  await Promise.all(
    [
      PageListStandard.Income,
      PageListStandard.Bills,
      PageListStandard.Food,
      PageListStandard.General,
      PageListStandard.Social,
      PageListStandard.Holiday,
    ].map((page) => insertStandardListFromCsv(db, uid, page)),
  );
};

type CSVFundRow = Omit<FundListRow, 'allocation_target'> & {
  allocation_target: number | 'null';
};

type CSVRowFundTransaction = Omit<RawDate<Transaction, 'date'>, 'drip'> & {
  fund_id: number;
  is_drip: 'true' | 'false';
};

const seedFunds = async (db: DatabaseTransactionConnectionType, uid: number): Promise<void> => {
  logger.info('[seed] creating funds data');

  await db.query(sql`DELETE FROM funds WHERE uid = ${uid}`);

  const rowsFundsRaw = await readTableFromCsv<CSVFundRow>('funds');
  const rowsFunds = rowsFundsRaw.map(nullableKey('allocation_target'));

  const { rows: fundIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO funds (uid, item, allocation_target)
  SELECT * FROM ${sql.unnest(
    rowsFunds.map((row) => [uid, row.item, row.allocation_target]),
    ['int4', 'text', 'float8'],
  )}
  RETURNING id
  `);

  const rowsTransactionsRaw = await readTableFromCsv<CSVRowFundTransaction>('funds_transactions');
  const rowsTransactions = rowsTransactionsRaw
    .map(nullableBool('is_drip'))
    .map(mapDates)
    .map(mapForeignId(rowsFundsRaw, fundIdRows, 'id', 'fund_id'));

  await db.query(sql`
  INSERT INTO funds_transactions (fund_id, date, units, price, fees, taxes, is_drip)
  SELECT * FROM ${sql.unnest(
    rowsTransactions.map((row) => [
      row.fund_id,
      row.date,
      row.units,
      row.price,
      row.fees,
      row.taxes,
      row.is_drip,
    ]),
    ['int4', 'date', 'float8', 'float8', 'int4', 'int4', 'bool'],
  )}
  `);
};

type CSVRowNetWorthCategory = {
  id: number;
  type: 'asset' | 'liability';
  category: string;
  color: string;
  is_option: 'true' | 'false' | 'null';
};

type CSVRowNetWorthSubcategory = {
  id: number;
  subcategory: string;
  has_credit_limit: 'true' | 'false' | 'null';
  appreciation_rate: number | 'null';
  is_saye: 'true' | 'false' | 'null';
  opacity: number;
  category_id: number;
};

type CSVRowNetWorth = {
  id: number;
  date: string;
};

type CSVRowNetWorthValue = {
  id: number;
  net_worth_id: number;
  subcategory: number;
  value: number | 'null';
  skip: 'true' | 'false' | 'null';
  comment: string;
};

type CSVRowFXValue = {
  values_id: number;
  value: number;
  currency: string;
};

type CSVRowLoanValue = {
  values_id: number;
  payments_remaining: number;
  rate: number;
};

type CSVRowOptionValue = {
  values_id: number;
  units: number;
  vested: number;
  strike_price: number;
  market_price: number;
};

type CSVRowCurrency = {
  net_worth_id: number;
  currency: string;
  rate: number;
};

type CSVRowCreditLimit = {
  net_worth_id: number;
  subcategory: number;
  value: number;
};

const seedNetWorth = async (db: DatabaseTransactionConnectionType, uid: number): Promise<void> => {
  logger.info('[seed] creating net worth data');

  await db.query(sql`DELETE FROM net_worth WHERE uid = ${uid}`);
  await db.query(sql`DELETE FROM net_worth_categories WHERE uid = ${uid}`);

  const rowsCategoriesRaw = await readTableFromCsv<CSVRowNetWorthCategory>('net_worth_categories');

  const rowsCategories = rowsCategoriesRaw
    .map(removeId)
    .map(nullableBool('is_option'))
    .map(mapUids(uid));

  const { rows: categoryIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth_categories (uid, type, category, color, is_option)
  SELECT * FROM ${sql.unnest(
    rowsCategories.map((row) => [uid, row.type, row.category, row.color, row.is_option]),
    ['int4', 'text', 'text', 'text', 'bool'],
  )}
  RETURNING id
  `);

  const rowsSubcategoriesRaw = await readTableFromCsv<CSVRowNetWorthSubcategory>(
    'net_worth_subcategories',
  );
  const rowsSubcategories = rowsSubcategoriesRaw
    .map(mapForeignId(rowsCategoriesRaw, categoryIdRows, 'id', 'category_id'))
    .map(removeId)
    .map(nullableBool('has_credit_limit'))
    .map(nullableKey('appreciation_rate'))
    .map(nullableBool('is_saye'));

  const { rows: subcategoryIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth_subcategories (category_id, subcategory, has_credit_limit, opacity, is_saye, appreciation_rate)
  SELECT * FROM ${sql.unnest(
    rowsSubcategories.map((row) => [
      row.category_id,
      row.subcategory,
      row.has_credit_limit,
      row.opacity,
      row.is_saye,
      row.appreciation_rate,
    ]),
    ['int4', 'text', 'bool', 'float8', 'bool', 'float8'],
  )}
  RETURNING id
  `);

  const rowsNetWorthRaw = await readTableFromCsv<CSVRowNetWorth>('net_worth');

  const rowsNetWorth = rowsNetWorthRaw.map(mapDatesWithUids(uid)).map(removeId);

  const { rows: netWorthIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth (uid, date)
  SELECT * FROM ${sql.unnest(
    rowsNetWorth.map((row) => [uid, row.date]),
    ['int4', 'date'],
  )}
  RETURNING id
  `);

  const rowsNetWorthValuesRaw = await readTableFromCsv<CSVRowNetWorthValue>('net_worth_values');

  const rowsNetWorthValues = rowsNetWorthValuesRaw
    .map(nullableKey('value'))
    .map(nullableKey('skip'))
    .map(removeColumn('comment'))
    .map(mapForeignId(rowsNetWorthRaw, netWorthIdRows, 'id', 'net_worth_id'))
    .map(mapForeignId(rowsSubcategoriesRaw, subcategoryIdRows, 'id', 'subcategory'))
    .map(removeId);

  const { rows: netWorthValueIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO net_worth_values (net_worth_id, subcategory, value, skip)
  SELECT * FROM ${sql.unnest(
    rowsNetWorthValues.map((row) => [row.net_worth_id, row.subcategory, row.value, row.skip]),
    ['int4', 'int4', 'int4', 'bool'],
  )}
  RETURNING id
  `);

  const rowsFXValuesRaw = await readTableFromCsv<CSVRowFXValue>('net_worth_fx_values');
  await db.query(sql`
  INSERT INTO net_worth_fx_values (values_id, value, currency)
  SELECT * FROM ${sql.unnest(
    rowsFXValuesRaw
      .map(mapForeignId(rowsNetWorthValuesRaw, netWorthValueIdRows, 'id', 'values_id'))
      .map((row) => [row.values_id, row.value, row.currency]),
    ['int4', 'float8', 'text'],
  )}
  `);

  const rowsLoanValuesRaw = await readTableFromCsv<CSVRowLoanValue>('net_worth_loan_values');
  await db.query(sql`
  INSERT INTO net_worth_loan_values (values_id, payments_remaining, rate)
  SELECT * FROM ${sql.unnest(
    rowsLoanValuesRaw
      .map(mapForeignId(rowsNetWorthValuesRaw, netWorthValueIdRows, 'id', 'values_id'))
      .map((row) => [row.values_id, row.payments_remaining, row.rate]),
    ['int4', 'int4', 'float8'],
  )}
  `);

  const rowsOptionValuesRaw = await readTableFromCsv<CSVRowOptionValue>('net_worth_option_values');
  await db.query(sql`
  INSERT INTO net_worth_option_values (values_id, units, vested, strike_price, market_price)
  SELECT * FROM ${sql.unnest(
    rowsOptionValuesRaw
      .map(mapForeignId(rowsNetWorthValuesRaw, netWorthValueIdRows, 'id', 'values_id'))
      .map((row) => [row.values_id, row.units, row.vested, row.strike_price, row.market_price]),
    ['int4', 'float8', 'float8', 'float8', 'float8'],
  )}
  `);

  const rowsCurrenciesRaw = await readTableFromCsv<CSVRowCurrency>('net_worth_currencies');
  const rowsCurrencies = rowsCurrenciesRaw.map(
    mapForeignId(rowsNetWorthRaw, netWorthIdRows, 'id', 'net_worth_id'),
  );
  await db.query(sql`
  INSERT INTO net_worth_currencies (net_worth_id, currency, rate)
  SELECT * FROM ${sql.unnest(
    rowsCurrencies.map((row) => [row.net_worth_id, row.currency, row.rate]),
    ['int4', 'text', 'float8'],
  )}
  `);

  const rowsCreditLimitRaw = await readTableFromCsv<CSVRowCreditLimit>('net_worth_credit_limit');
  const rowsCreditLimit = rowsCreditLimitRaw
    .map(mapForeignId(rowsNetWorthRaw, netWorthIdRows, 'id', 'net_worth_id'))
    .map(mapForeignId(rowsSubcategoriesRaw, subcategoryIdRows, 'id', 'subcategory'));
  await db.query(sql`
  INSERT INTO net_worth_credit_limit (net_worth_id, subcategory, value)
  SELECT * FROM ${sql.unnest(
    rowsCreditLimit.map((row) => [row.net_worth_id, row.subcategory, row.value]),
    ['int4', 'int4', 'int4'],
  )}
  `);
};

export const seed = withSlonik(async (db) => {
  const {
    rows: [adminUser],
  } = await db.query<{ uid: number }>(sql`
  SELECT uid FROM users
  WHERE name = ${'admin'}
  LIMIT 1
  `);
  if (!adminUser) {
    throw new Error('Admin user seed must run prior to stage data seed');
  }

  const { uid } = adminUser;

  await seedNetWorth(db, uid);
  await seedStandardList(db, uid);
  await seedFunds(db, uid);
});

if (require.main === module) {
  seed()
    .then(() => {
      getPool().end();
    })
    .catch((err) => {
      logger.error('Caught fatal error', {
        err: err.stack,
      });
      process.exit(1);
    });
}
