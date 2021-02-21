import path from 'path';
import { compose } from '@typed/compose';
import parse from 'csv-parse/lib/sync';
import { addMonths, setDay, startOfMonth } from 'date-fns';
import fs from 'fs-extra';
import Knex from 'knex';

import logger from '~api/modules/logger';
import { PageListStandard } from '~api/types';

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

function mapDates<R extends { date: string }>({
  date,
  ...row
}: R): Omit<R, 'date'> & { date: Date } {
  const [, monthDelta, , dayOfMonth] = (date as string).match(
    /^((-|\+)\d+)((-|\+)\d+)$/,
  ) as RegExpMatchArray;
  return {
    date: setDay(addMonths(monthStart, Number(monthDelta)), Number(dayOfMonth)),
    ...row,
  };
}

const mapDatesWithUids = <R extends { date: string }>(
  uid: number,
): ((row: R) => Omit<R, 'date'> & { date: Date; uid: number }) => compose(mapDates, mapUids(uid));

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
  parentIds: number[],
  parentKey: ParentKey,
  foreignKey: ForeignKey,
) => (child: Child): Child => ({
  ...child,
  [foreignKey]:
    parentIds[
      parentsRaw.findIndex((parent) => (parent[parentKey] as number) === child[foreignKey])
    ],
});

async function insertStandardListFromCsv(
  trx: Knex.Transaction,
  uid: number,
  tableName: PageListStandard,
): Promise<void> {
  logger.info(`[seed] creating ${tableName} data`);

  await trx(tableName).where({ uid }).del();

  const rows = await readTableFromCsv<{ date: string }>(tableName);
  await trx(tableName).insert(rows.map(mapDatesWithUids(uid)));
}

async function seedStandardList(trx: Knex.Transaction, uid: number): Promise<void> {
  await Promise.all(
    [
      PageListStandard.Income,
      PageListStandard.Bills,
      PageListStandard.Food,
      PageListStandard.General,
      PageListStandard.Social,
      PageListStandard.Holiday,
    ].map((page) => insertStandardListFromCsv(trx, uid, page)),
  );
}

async function seedFunds(trx: Knex.Transaction, uid: number): Promise<void> {
  logger.info('[seed] creating funds data');

  await trx('funds').where({ uid }).del();

  const rowsFunds = (
    await readTableFromCsv<{ id: number; allocation_target: string | number }>('funds')
  ).map(({ allocation_target, ...rest }) => ({
    ...rest,
    allocation_target:
      allocation_target.toString().toUpperCase() === 'NULL' ? null : allocation_target,
  }));

  const rowsTransactions = await readTableFromCsv<{ date: string; fund_id: number }>(
    'funds_transactions',
  );

  const fundIds = await trx('funds')
    .insert(rowsFunds.map(mapUids(uid)).map(removeId))
    .returning('id');

  await trx('funds_transactions').insert(
    rowsTransactions.map(mapDates).map(({ fund_id, ...rest }) => ({
      fund_id: fundIds[rowsFunds.findIndex((row) => row.id === fund_id)],
      ...rest,
    })),
  );
}

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

type CSVRowValueDependent = { values_id: number };

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

async function seedNetWorth(trx: Knex.Transaction, uid: number): Promise<void> {
  logger.info('[seed] creating net worth data');

  const rowsCategoriesRaw = await readTableFromCsv<CSVRowNetWorthCategory>('net_worth_categories');

  const rowsCategories = rowsCategoriesRaw
    .map(removeId)
    .map(nullableBool('is_option'))
    .map(mapUids(uid));

  const categoryIds = await trx('net_worth_categories').insert(rowsCategories).returning('id');

  const rowsSubcategoriesRaw = await readTableFromCsv<CSVRowNetWorthSubcategory>(
    'net_worth_subcategories',
  );
  const rowsSubcategories = rowsSubcategoriesRaw
    .map(mapForeignId(rowsCategoriesRaw, categoryIds, 'id', 'category_id'))
    .map(removeId)
    .map(nullableBool('has_credit_limit'))
    .map(nullableBool('is_saye'));

  const subcategoryIds = await trx('net_worth_subcategories')
    .insert(rowsSubcategories)
    .returning('id');

  const rowsNetWorthRaw = await readTableFromCsv<CSVRowNetWorth>('net_worth');

  const rowsNetWorth = rowsNetWorthRaw.map(mapDatesWithUids(uid)).map(removeId);

  const netWorthIds = await trx('net_worth').insert(rowsNetWorth).returning('id');

  const rowsNetWorthValuesRaw = await readTableFromCsv<CSVRowNetWorthValue>('net_worth_values');

  const rowsNetWorthValues = rowsNetWorthValuesRaw
    .map(nullableKey('value'))
    .map(nullableKey('skip'))
    .map(removeColumn('comment'))
    .map(mapForeignId(rowsNetWorthRaw, netWorthIds, 'id', 'net_worth_id'))
    .map(mapForeignId(rowsSubcategoriesRaw, subcategoryIds, 'id', 'subcategory'))
    .map(removeId);

  const netWorthValueIds = await trx('net_worth_values').insert(rowsNetWorthValues).returning('id');

  await Promise.all(
    ['net_worth_fx_values', 'net_worth_mortgage_values', 'net_worth_option_values'].map(
      async (childTable) => {
        const rowsRaw = await readTableFromCsv<CSVRowValueDependent>(childTable);
        return trx(childTable).insert(
          rowsRaw.map(mapForeignId(rowsNetWorthValuesRaw, netWorthValueIds, 'id', 'values_id')),
        );
      },
    ),
  );

  const rowsCurrenciesRaw = await readTableFromCsv<CSVRowCurrency>('net_worth_currencies');
  const rowsCurrencies = rowsCurrenciesRaw.map(
    mapForeignId(rowsNetWorthRaw, netWorthIds, 'id', 'net_worth_id'),
  );
  await trx('net_worth_currencies').insert(rowsCurrencies);

  const rowsCreditLimitRaw = await readTableFromCsv<CSVRowCreditLimit>('net_worth_credit_limit');
  const rowsCreditLimit = rowsCreditLimitRaw
    .map(mapForeignId(rowsNetWorthRaw, netWorthIds, 'id', 'net_worth_id'))
    .map(mapForeignId(rowsSubcategoriesRaw, subcategoryIds, 'id', 'subcategory'));
  await trx('net_worth_credit_limit').insert(rowsCreditLimit);
}

export async function seed(db: Knex): Promise<void> {
  const trx = await db.transaction();

  const adminUser = await trx('users')
    .where({ name: 'admin' })
    .select<{ uid: number }>('uid')
    .first();
  if (!adminUser) {
    throw new Error('Admin user seed must run prior to stage data seed');
  }

  const { uid } = adminUser;

  await seedNetWorth(trx, uid);
  await seedStandardList(trx, uid);
  await seedFunds(trx, uid);

  await trx.commit();
}
