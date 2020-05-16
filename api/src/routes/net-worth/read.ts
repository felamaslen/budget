import * as boom from '@hapi/boom';
import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import startOfMonth from 'date-fns/startOfMonth';
import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import format from 'date-fns/format';
import { sql, DatabasePoolConnectionType } from 'slonik';

import config from '~api/config';
import { authDbRoute } from '~api/middleware/request';
import { Entry, ComplexValue, ComplexValueItem, FXValue, OptionValue, ValueObject } from './types';

type ValuesDerivedRow = {
  netWorthId: string;
  id: string;
  subcategory: string;
  skip: boolean | null;
  value: number | null;
  fx_values: (number | null)[];
  fx_currencies: (string | null)[];
  option_units: (number | null)[];
  option_strikes: (number | null)[];
  option_markets: (number | null)[];
};

type ValuesProcessed = ValueObject & { netWorthId: string; id: string };

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const isSimpleValue = (
  value: number | null,
  fx_values: (number | null)[],
  option_values: (number | null)[],
): value is number =>
  value !== null &&
  fx_values.every(item => item === null) &&
  option_values.every(item => item === null);

const makeWithComplexValue = <V extends ComplexValueItem, A1 = number, A2 = number>(
  getComplexValue: (value: number, a1: A1 | null, a2: A2 | null) => V,
) => (complexValues: (number | null)[], a1: (A1 | null)[] = [], a2: (A2 | null)[] = []) => (
  values: ComplexValue,
): ComplexValue =>
  complexValues
    .filter((complexValue: number | null): complexValue is number => complexValue !== null)
    .reduce(
      (last: ComplexValue, complexValue: number, index: number): ComplexValue => [
        ...last,
        getComplexValue(complexValue, a1[index], a2[index]),
      ],
      values,
    );

const withFx = makeWithComplexValue<FXValue, string>(
  (value, currency): FXValue =>
    ({
      value,
      currency,
    } as FXValue),
);

const withOptions = makeWithComplexValue<OptionValue>(
  (units, strikePrice, marketPrice): OptionValue =>
    ({
      units,
      strikePrice,
      marketPrice,
    } as OptionValue),
);

function processValuesRows({
  netWorthId,
  id,
  subcategory,
  skip,
  value,
  fx_values,
  fx_currencies,
  option_units,
  option_strikes,
  option_markets,
}: ValuesDerivedRow): ValuesProcessed {
  const base = {
    netWorthId,
    id,
    subcategory,
    skip,
  };

  if (isSimpleValue(value, fx_values, option_units)) {
    return {
      ...base,
      value,
    };
  }

  const complexValue: ComplexValue = compose(
    withFx(fx_values, fx_currencies),
    withOptions(option_units, option_strikes, option_markets),
  )(value === null ? [] : [value]);

  return {
    ...base,
    value: complexValue,
  };
}

const getValuesRows = async (
  db: DatabasePoolConnectionType,
  ids: string[],
): Promise<ValuesProcessed[]> => {
  const { rows } = await db.query<ValuesDerivedRow>(sql`
    SELECT
    ${sql.join(
      [
        sql`nwv.net_worth_id as ${sql.identifier(['netWorthId'])}`,
        sql`nwv.id`,
        sql`nwv.subcategory`,
        sql`nwv.skip`,
        sql`nwv.value`,
        sql`ARRAY_AGG(nwfxv.value) as fx_values`,
        sql`ARRAY_AGG(nwfxv.currency) as fx_currencies`,
        sql`ARRAY_AGG(nwopv.units) as option_units`,
        sql`ARRAY_AGG(nwopv.strike_price) as option_strikes`,
        sql`ARRAY_AGG(nwopv.market_price) as option_markets`,
      ],
      sql`, `,
    )}
    FROM net_worth_values as nwv
    LEFT JOIN net_worth_fx_values as nwfxv ON nwfxv.values_id = nwv.id
    LEFT JOIN net_worth_option_values as nwopv ON nwopv.values_id = nwv.id
    WHERE nwv.net_worth_id = ANY(${sql.array(ids, 'uuid')})
    GROUP BY nwv.id
  `);

  return rows.map(processValuesRows);
};

type CreditLimitRow = {
  netWorthId: string;
  subcategory: string;
  value: number;
};

const getCreditLimit = async (
  db: DatabasePoolConnectionType,
  ids: string[],
): Promise<readonly CreditLimitRow[]> => {
  const { rows } = await db.query<CreditLimitRow>(sql`
    SELECT ${sql.join(
      [
        sql`nwcl.net_worth_id as ${sql.identifier(['netWorthId'])}`,
        sql`nwcl.subcategory`,
        sql`nwcl.value`,
      ],
      sql`, `,
    )}
    FROM net_worth_credit_limit AS nwcl
    WHERE nwcl.net_worth_id = ANY(${sql.array(ids, 'uuid')})
  `);

  return rows;
};

type CurrencyRow = {
  netWorthId: string;
  id: string;
  currency: string;
  rate: number;
};

const getCurrencies = async (
  db: DatabasePoolConnectionType,
  ids: string[],
): Promise<readonly CurrencyRow[]> => {
  const { rows } = await db.query<CurrencyRow>(sql`
    SELECT ${sql.join(
      [
        sql`nwc.net_worth_id as ${sql.identifier(['netWorthId'])}`,
        sql`nwc.id`,
        sql`nwc.currency`,
        sql`nwc.rate`,
      ],
      sql`, `,
    )}
    FROM net_worth_currencies AS nwc
    WHERE nwc.net_worth_id = ANY(${sql.array(ids, 'uuid')})
  `);

  return rows;
};

type WithoutKey<T> = Pick<T, Exclude<keyof T, 'netWorthId'>>[];

function withoutId<T extends { netWorthId: string }>(rows: readonly T[]): WithoutKey<T> {
  return rows.map(({ netWorthId: discard, ...rest }) => rest);
}

export const fetchById = async (
  db: DatabasePoolConnectionType,
  netWorthId: string,
  uid: string,
): Promise<Entry | null> => {
  const {
    rows: [netWorth],
  } = await db.query<{ date: string }>(sql`
    SELECT nw.date
    FROM net_worth AS nw
    WHERE ${sql.join([sql`nw.id = ${netWorthId}`, sql`nw.uid = ${uid}`], sql` AND `)}
  `);

  if (!netWorth) {
    return null;
  }

  const date = formatDate(new Date(netWorth.date));

  const [values, creditLimit, currencies] = await Promise.all([
    getValuesRows(db, [netWorthId]),
    getCreditLimit(db, [netWorthId]),
    getCurrencies(db, [netWorthId]),
  ]);

  return {
    id: netWorthId,
    date,
    values: withoutId(values),
    creditLimit: withoutId(creditLimit),
    currencies: withoutId(currencies),
  };
};

function splitById<T extends { netWorthId: string }>(
  rows: readonly T[],
): {
  [netWorthId: string]: WithoutKey<T>;
} {
  return rows.reduce(
    (items: { [netWorthId: string]: WithoutKey<T> }, { netWorthId, ...rest }) => ({
      ...items,
      [netWorthId]: [...(items[netWorthId] || []), rest],
    }),
    {},
  );
}

const fetchOld = async (
  db: DatabasePoolConnectionType,
  uid: string,
  startDate: Date,
  oldDateEnd: Date,
): Promise<number[]> => {
  const { rows } = await db.query<{ value: number }>(sql`
    SELECT (${sql.join(
      [
        sql`SUM(COALESCE(nwv.value, 0))`,
        sql`SUM(COALESCE(nwfx.value * nwc.rate * 100, 0))::integer`,
        sql`SUM(COALESCE(nwop.units * nwop.market_price, 0))::integer`,
      ],
      sql` + `,
    )}) as value
    FROM net_worth as nw
    LEFT JOIN net_worth_values as nwv ON nwv.net_worth_id = nw.id
    LEFT JOIN net_worth_fx_values as nwfx ON nwfx.values_id = nwv.id
    LEFT JOIN net_worth_option_values as nwop ON nwop.values_id = nwv.id
    LEFT JOIN net_worth_currencies as nwc
      ON nwc.net_worth_id = nw.id
      AND nwc.currency = nwfx.currency
    WHERE ${sql.join(
      [
        sql`nw.uid = ${uid}`,
        sql`nw.date < ${formatDate(oldDateEnd)}`,
        sql`nw.date >= ${formatDate(startDate)}`,
        sql`(${sql.join([sql`nwv.skip = false`, sql`nwv.skip IS NULL`], sql` OR `)})`,
      ],
      sql` AND `,
    )}
    GROUP BY nw.date
    ORDER BY nw.date
  `);

  return rows.map(({ value }) => Number(value));
};

const fetchAll = async (
  db: DatabasePoolConnectionType,
  uid: string,
  oldDateEnd: Date,
): Promise<Entry[]> => {
  const { rows: netWorth } = await db.query<{ id: string; date: string }>(sql`
    SELECT ${sql.identifier(['id'])}, ${sql.identifier(['date'])}
    FROM net_worth as ${sql.identifier(['nw'])}
    WHERE ${sql.join([sql`uid = ${uid}`, sql`date >= ${formatDate(oldDateEnd)}`], sql` AND `)}
    ORDER BY ${sql.identifier(['date'])}
  `);

  const netWorthIds = netWorth.map(({ id }) => id);

  const [valuesRows, creditLimit, currencies] = await Promise.all([
    getValuesRows(db, netWorthIds),
    getCreditLimit(db, netWorthIds),
    getCurrencies(db, netWorthIds),
  ]);

  const valuesById = splitById(valuesRows);
  const creditLimitById = splitById(creditLimit);
  const currenciesById = splitById(currencies);

  return netWorth.map(({ id, date }) => ({
    id,
    date: formatDate(new Date(date)),
    values: valuesById[id],
    creditLimit: creditLimitById[id],
    currencies: currenciesById[id],
  }));
};

export const onRead = authDbRoute(async (db, req, res) => {
  const uid = req.user.uid;

  if (!req.params.id) {
    const { numLast, startYear, startMonth } = config.data.overview;

    const oldDateEnd = startOfMonth(addMonths(new Date(), -numLast));
    const startDate = startOfMonth(setMonth(setYear(new Date(), startYear), startMonth));

    const [items, old] = await Promise.all([
      fetchAll(db, uid, oldDateEnd),
      fetchOld(db, uid, startDate, oldDateEnd),
    ]);

    res.json({ items, old });
    return;
  }

  const item = await fetchById(db, req.params.id, uid);

  if (!item) {
    throw boom.notFound('Net worth row not found');
  }

  res.json(item);
});
