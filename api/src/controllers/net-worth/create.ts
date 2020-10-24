import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '../shared';
import { fetchById } from './read';
import {
  getValueFromRow,
  entryRowHasCurrencies,
  entryRowHasCreditLimit,
  validateCategories,
} from './shared';
import {
  insertEntry,
  insertValues,
  insertFXValues,
  insertOptionValues,
  insertWithNetWorthId,
} from '~api/queries';
import {
  Entry,
  CreateEntry,
  ValueObject,
  ComplexValueItem,
  Value,
  ComplexValue,
  Currency,
  JoinedEntryRow,
  FXValue,
  OptionValue,
  CreditLimit,
} from '~api/types';

const isSimpleValue = (value: ComplexValueItem): value is number => typeof value === 'number';
const isComplexValue = (value?: Value | ComplexValue): value is ComplexValue =>
  !!value && Array.isArray(value);
const isFXValue = (value: ComplexValueItem): value is FXValue =>
  typeof value !== 'number' && Reflect.has(value, 'currency');
const isOptionValue = (value: ComplexValueItem): value is OptionValue =>
  typeof value !== 'number' && Reflect.has(value, 'strikePrice');

function getRowValue(value: ValueObject['value']): number | null {
  if (!(value && Array.isArray(value))) {
    return value;
  }

  const simpleValues: number[] = value.filter(isSimpleValue);
  if (!simpleValues.length) {
    return null;
  }

  return simpleValues.reduce((sum, item) => sum + item, 0);
}

type WithValueId<V> = V & { valueId: number };

const filterComplexValues = <V extends Exclude<ComplexValueItem, number>>(
  valueIds: number[],
  filterItems: (value: ComplexValueItem) => value is V,
  values: ValueObject[],
): WithValueId<V>[] =>
  values.reduce<WithValueId<V>[]>(
    (last, { value }, index) =>
      isComplexValue(value)
        ? [
            ...last,
            ...value
              .filter(filterItems)
              .map<WithValueId<V>>((item) => ({ ...item, valueId: valueIds[index] })),
          ]
        : last,

    [],
  );

export async function createValues(
  db: DatabaseTransactionConnectionType,
  netWorthId: number,
  values: ValueObject[] = [],
): Promise<void> {
  if (!values.length) {
    return;
  }

  const valuesRows = values.map<[number, boolean | null, number, number | null]>(
    ({ subcategory, skip, value }) => [netWorthId, skip, subcategory, getRowValue(value)],
  );
  const valueIds = await insertValues(db, valuesRows);

  const fxValuesRows = filterComplexValues<FXValue>(valueIds, isFXValue, values).map<
    [number, number, string]
  >(({ valueId, value, currency }) => [valueId, value, currency]);

  const optionValuesRows = filterComplexValues<OptionValue>(valueIds, isOptionValue, values).map<
    [number, number, number, number, number]
  >(({ valueId, units, strikePrice, marketPrice, vested }) => [
    valueId,
    units,
    strikePrice,
    marketPrice,
    vested,
  ]);

  await Promise.all([insertFXValues(db, fxValuesRows), insertOptionValues(db, optionValuesRows)]);
}

export const createCreditLimits = insertWithNetWorthId<CreditLimit>(
  'net_worth_credit_limit',
  ['subcategory', 'value'],
  ['int4', 'float4'],
);

export const createCurrencies = insertWithNetWorthId<Currency>(
  'net_worth_currencies',
  ['currency', 'rate'],
  ['varchar', 'float8'],
);

export function combineJoinedEntryRows(entryRows: readonly JoinedEntryRow[]): Entry {
  if (!entryRows.length) {
    throw boom.notFound('Net worth entry not found');
  }

  const currencies = entryRowHasCurrencies(entryRows)
    ? entryRows[0].currency_ids.reduce<Currency[]>(
        (last, currencyId, index) => [
          ...last,
          {
            id: currencyId,
            currency: entryRows[0].currencies[index],
            rate: entryRows[0].currency_rates[index],
          },
        ],
        [],
      )
    : [];

  const values = entryRows.reduce<ValueObject[]>((last, row) => {
    const value = getValueFromRow(row);

    const valueObject: ValueObject = {
      id: row.value_id,
      subcategory: row.value_subcategory,
      skip: row.value_skip,
      value,
    };

    return [...last, valueObject];
  }, []);

  const creditLimit = entryRowHasCreditLimit(entryRows)
    ? entryRows[0].credit_limit_subcategory.reduce<CreditLimit[]>(
        (last, subcategory, index) => [
          ...last,
          {
            subcategory,
            value: entryRows[0].credit_limit_value[index],
          },
        ],
        [],
      )
    : [];

  return {
    id: entryRows[0].id,
    date: entryRows[0].date,
    currencies,
    values,
    creditLimit,
  };
}

export async function createNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  data: CreateEntry,
): Promise<Entry> {
  await validateCategories(db, data);
  const { date, values, creditLimit, currencies } = data;
  const netWorthId = await insertEntry(db, uid, formatDate(date));

  await Promise.all([
    createValues(db, netWorthId, values),
    createCreditLimits(db, netWorthId, creditLimit),
    createCurrencies(db, netWorthId, currencies),
  ]);

  const entry = await fetchById(db, uid, netWorthId);
  return entry;
}
