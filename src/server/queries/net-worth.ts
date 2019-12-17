import { sql, DatabasePoolConnectionType, QueryResultType } from 'slonik';
import format from 'date-fns/format';

import {
  NetWorth,
  Category,
  Subcategory,
  Entry,
  FXValue,
  Value,
  CreditLimit,
  Currency,
} from '~/types/net-worth';
// import errors from '~/server/errors';
import { getViewStartDate } from '~/server/queries/overview';

export interface SpecificItem {
  id: string;
}

// const haveSpecificItem = (data: SpecificItem | undefined): data is SpecificItem =>
//   Boolean(data && data.id);
//
// const whereId = (data: SpecificItem | undefined): SqlSqlTokenType<QueryResultRowType<string>> =>
//   haveSpecificItem(data) ? sql`id = ${data.id}` : sql`true`;

const getCategories = async (db: DatabasePoolConnectionType): Promise<readonly Category[]> => {
  const { rows } = await db.query<Category>(sql`
    select *
    from net_worth_categories
  `);

  return rows;
};

const getSubcategories = async (
  db: DatabasePoolConnectionType,
): Promise<readonly Subcategory[]> => {
  const { rows } = await db.query<Subcategory>(sql`
    select *
    from net_worth_subcategories
  `);

  return rows;
};

interface EntryIDRow {
  id: string;
  date: string;
}

type ValueRow = Value & {
  netWorthId: string;
  fxValues: number[];
  fxCurrencies: string[];
  value: number | null;
};

type CurrencyRow = Currency & { netWorthId: string };

type CreditLimitRow = CreditLimit & { netWorthId: string };

const getEntries = async (
  db: DatabasePoolConnectionType,
  userId: string,
): Promise<readonly Entry[]> => {
  const { rows: netWorth } = await db.query<EntryIDRow>(sql`
    select id, date
    from net_worth nw
    where ${sql.join(
      [sql`uid = ${userId}`, sql`date >= ${format(getViewStartDate(), 'yyyy-MM-dd')}`],
      sql` and `,
    )}
  `);

  const netWorthIds = netWorth.map(({ id }) => id);

  const [values, creditLimit, currencies]: [
    QueryResultType<ValueRow>,
    QueryResultType<CreditLimitRow>,
    QueryResultType<CurrencyRow>,
  ] = await Promise.all([
    db.query<ValueRow>(sql`
      select
        nwv.net_worth_id as ${sql.identifier(['netWorthId'])}
        ,nwv.id
        ,nwv.subcategory
        ,nwv.skip
        ,nwv.value
        ,array_agg(nwfxv.value) as ${sql.identifier(['fxValues'])}
        ,array_agg(nwfxv.currency) as ${sql.identifier(['fxCurrencies'])}
      from net_worth_values nwv
      left join net_worth_fx_values nwfxv on nwfxv.values_id = nwv.id
      where nwv.net_worth_id = any (${sql.array(netWorthIds, sql`uuid[]`)})
      group by nwv.id
      `),
    db.query<CreditLimitRow>(sql`
      select
        nwcl.net_worth_id as ${sql.identifier(['netWorthId'])}
        ,nwcl.subcategory
        ,nwcl.value as ${sql.identifier(['limit'])}
      from net_worth_credit_limit nwcl
      where nwcl.net_worth_id = any (${sql.array(netWorthIds, sql`uuid[]`)})
      `),
    db.query<CurrencyRow>(sql`
      select
        nwc.net_worth_id as ${sql.identifier(['netWorthId'])}
        ,nwc.id
        ,nwc.currency
        ,nwc.rate
      from net_worth_currencies nwc
      where nwc.net_worth_id = any (${sql.array(netWorthIds, sql`uuid[]`)})
      `),
  ]);

  return netWorth.map(({ id, date }: EntryIDRow) => ({
    id,
    date: new Date(date),
    values: values.rows
      .filter(({ netWorthId }) => netWorthId === id)
      .map(({ id: valueId, subcategory, skip, value, fxValues, fxCurrencies }: ValueRow) => ({
        id: valueId,
        subcategory,
        skip,
        value: fxCurrencies.every(item => !item)
          ? value
          : fxCurrencies.reduce<FXValue>(
              (last: FXValue, currency: string, index: number) => [
                ...last,
                { value: fxValues[index], currency },
              ],
              value ? [value] : [],
            ),
      })),
    creditLimit: creditLimit.rows.map(({ subcategory, limit }) => ({ subcategory, limit })),
    currencies: currencies.rows.map(({ id: currencyId, currency, rate }) => ({
      id: currencyId,
      currency,
      rate,
    })),
  }));
};

export const getNetWorth = async (
  db: DatabasePoolConnectionType,
  userId: string,
): Promise<NetWorth> => {
  const [categories, subcategories, entries] = await Promise.all([
    getCategories(db),
    getSubcategories(db),
    getEntries(db, userId),
  ]);

  return { categories, subcategories, entries };
};
