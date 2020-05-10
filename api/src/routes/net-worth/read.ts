import * as boom from '@hapi/boom';
import { RequestHandler } from 'express';
import addMonths from 'date-fns/addMonths';
import startOfMonth from 'date-fns/startOfMonth';
import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import format from 'date-fns/format';

import config from '~api/config';
import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { Entry, ComplexValue, ValueObject } from './types';

type ValuesRow = {
  netWorthId: string;
  id: string;
  subcategory: string;
  skip: boolean | null;
  value: number | null;
  fx_values: (number | null)[];
  fx_currencies: (string | null)[];
};

type ValuesProcessed = ValueObject & { netWorthId: string; id: string };

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const isSimpleValue = (value: number | null, fx_values: (number | null)[]): value is number =>
  value !== null && fx_values.every(item => item === null);

function processValuesRows({
  netWorthId,
  id,
  subcategory,
  skip,
  value,
  fx_values,
  fx_currencies,
}: ValuesRow): ValuesProcessed {
  const base = {
    netWorthId,
    id,
    subcategory,
    skip,
  };

  if (isSimpleValue(value, fx_values)) {
    return {
      ...base,
      value,
    };
  }

  const initialValue: ComplexValue = value === null ? [] : [value];

  const valueWithFx = fx_values
    .filter((fxValue: number | null): fxValue is number => fxValue !== null)
    .reduce(
      (last: ComplexValue, fxValue: number, index: number) => [
        ...last,
        {
          value: fxValue,
          currency: fx_currencies[index] || '',
        },
      ],
      initialValue,
    );

  return {
    ...base,
    value: valueWithFx,
  };
}

async function getValuesRows(ids: string[]): Promise<ValuesProcessed[]> {
  const rows = await db
    .select<ValuesRow[]>(
      'nwv.net_worth_id as netWorthId',
      'nwv.id',
      'nwv.subcategory',
      'nwv.skip',
      'nwv.value',
      db.raw('ARRAY_AGG(nwfxv.value) as fx_values'),
      db.raw('ARRAY_AGG(nwfxv.currency) as fx_currencies'),
    )
    .from('net_worth_values as nwv')
    .leftJoin('net_worth_fx_values as nwfxv', 'nwfxv.values_id', 'nwv.id')
    .whereIn('nwv.net_worth_id', ids)
    .groupBy('nwv.id');

  return rows.map(processValuesRows);
}

type CreditLimitRow = {
  netWorthId: string;
  subcategory: string;
  value: number;
};

const getCreditLimit = async (ids: string[]): Promise<CreditLimitRow[]> =>
  db
    .select<CreditLimitRow[]>('nwcl.net_worth_id as netWorthId', 'nwcl.subcategory', 'nwcl.value')
    .from('net_worth_credit_limit as nwcl')
    .whereIn('nwcl.net_worth_id', ids);

type CurrencyRow = {
  netWorthId: string;
  id: string;
  currency: string;
  rate: number;
};

const getCurrencies = async (ids: string[]): Promise<CurrencyRow[]> =>
  db
    .select<CurrencyRow[]>('nwc.net_worth_id as netWorthId', 'nwc.id', 'nwc.currency', 'nwc.rate')
    .from('net_worth_currencies as nwc')
    .whereIn('nwc.net_worth_id', ids);

type WithoutKey<T> = Pick<T, Exclude<keyof T, 'netWorthId'>>[];

function withoutId<T extends { netWorthId: string }>(rows: T[]): WithoutKey<T> {
  return rows.map(({ netWorthId: discard, ...rest }) => rest);
}

export async function fetchById(netWorthId: string, uid: string): Promise<Entry | null> {
  const [netWorth] = await db
    .select<{ date: Date }[]>('nw.date')
    .from('net_worth as nw')
    .where('nw.id', '=', netWorthId)
    .where('nw.uid', '=', uid);

  if (!netWorth) {
    return null;
  }

  const date = formatDate(netWorth.date);

  const [values, creditLimit, currencies] = await Promise.all([
    getValuesRows([netWorthId]),
    getCreditLimit([netWorthId]),
    getCurrencies([netWorthId]),
  ]);

  return {
    id: netWorthId,
    date,
    values: withoutId(values),
    creditLimit: withoutId(creditLimit),
    currencies: withoutId(currencies),
  };
}

function splitById<T extends { netWorthId: string }>(
  rows: T[],
): {
  [netWorthId: string]: WithoutKey<T>;
} {
  return rows.reduce(
    (items: { [netWorthId: string]: WithoutKey<T> }, { netWorthId, ...rest }) => ({
      ...items,
      [netWorthId]: (items[netWorthId] || []).concat([rest]),
    }),
    {},
  );
}

async function fetchOld(uid: string, startDate: Date, oldDateEnd: Date): Promise<number[]> {
  const rows = await db
    .select<
      {
        value: number;
      }[]
    >(db.raw('sum(coalesce(nwv.value, (nwfx.value * nwc.rate * 100), 0))::integer as value'))
    .from('net_worth as nw')
    .leftJoin('net_worth_values as nwv', 'nwv.net_worth_id', 'nw.id')
    .leftJoin('net_worth_fx_values as nwfx', 'nwfx.values_id', 'nwv.id')
    .leftJoin('net_worth_currencies as nwc', qb1 =>
      qb1.on('nwc.net_worth_id', 'nw.id').on('nwc.currency', 'nwfx.currency'),
    )
    .where('nw.uid', '=', uid)
    .where('nw.date', '<', oldDateEnd)
    .where('nw.date', '>=', startDate)
    .where(qb1 => qb1.where('nwv.skip', '=', false).orWhere('nwv.skip', null))
    .groupBy('nw.date')
    .orderBy('nw.date');

  return rows.map(({ value }) => value);
}

async function fetchAll(uid: string, oldDateEnd: Date): Promise<Entry[]> {
  const netWorth = await db
    .select<
      {
        id: string;
        date: Date;
      }[]
    >('id', 'date')
    .from('net_worth as nw')
    .where('uid', '=', uid)
    .where('date', '>=', oldDateEnd)
    .orderBy('date');

  const netWorthIds = netWorth.map(({ id }) => id);

  const [valuesRows, creditLimit, currencies] = await Promise.all([
    getValuesRows(netWorthIds),
    getCreditLimit(netWorthIds),
    getCurrencies(netWorthIds),
  ]);

  const valuesById = splitById(valuesRows);
  const creditLimitById = splitById(creditLimit);
  const currenciesById = splitById(currencies);

  return netWorth.map(({ id, date }) => ({
    id,
    date: formatDate(date),
    values: valuesById[id],
    creditLimit: creditLimitById[id],
    currencies: currenciesById[id],
  }));
}

export const onRead: RequestHandler = catchAsyncErrors(
  async (req, res): Promise<void> => {
    const uid = req.user.uid;

    if (!req.params.id) {
      const { numLast, startYear, startMonth } = config.data.overview;

      const oldDateEnd = startOfMonth(addMonths(new Date(), -numLast));
      const startDate = startOfMonth(setMonth(setYear(new Date(), startYear), startMonth));

      const [items, old] = await Promise.all([
        fetchAll(uid, oldDateEnd),
        fetchOld(uid, startDate, oldDateEnd),
      ]);

      res.json({ items, old });
      return;
    }

    const item = await fetchById(req.params.id, uid);

    if (!item) {
      throw boom.notFound('Net worth row not found');
    }

    res.json(item);
  },
);
