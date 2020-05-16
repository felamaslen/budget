import { sql, DatabasePoolConnectionType } from 'slonik';

import { authDbRoute } from '~api/middleware/request';
import { formatDate, fetchById } from './read';
import {
  Value,
  CreditLimit,
  Currency,
  ComplexValue,
  ComplexValueItem,
  ValueObject,
  FXValue,
  OptionValue,
} from './types';

const getSimpleValues = (value: ComplexValueItem): value is number => typeof value === 'number';
const getComplexValues = (value?: Value | ComplexValue): value is ComplexValue =>
  !!value && Array.isArray(value);
const getFxValues = (value: ComplexValueItem): value is FXValue =>
  typeof value !== 'number' && Reflect.has(value, 'currency');
const getOptionValues = (value: ComplexValueItem): value is OptionValue =>
  typeof value !== 'number' && Reflect.has(value, 'strikePrice');

function getRowValue(value: ValueObject['value']): number | null {
  if (!(value && Array.isArray(value))) {
    return value;
  }

  const simpleValues: number[] = value.filter(getSimpleValues);
  if (!simpleValues.length) {
    return null;
  }

  return simpleValues.reduce((sum, item) => sum + item, 0);
}

const getValueRow = (netWorthId: string) => ({
  subcategory,
  skip = null,
  value,
}: ValueObject): [string, boolean | null, string, number | null] => [
  netWorthId,
  skip,
  subcategory,
  getRowValue(value),
];

type WithValueId<V> = V & { valueId: string };

const filterComplexValues = <V extends Exclude<ComplexValueItem, number>>(
  valueIds: string[],
  filterItems: (value: ComplexValueItem) => value is V,
  values: ValueObject[],
): WithValueId<V>[] =>
  values
    .map(({ value }: ValueObject): Value => value)
    .reduce(
      (last: WithValueId<V>[], items: Value, index: number): WithValueId<V>[] =>
        getComplexValues(items)
          ? [
              ...last,
              ...items
                .filter(filterItems)
                .map((item: V) => ({ ...item, valueId: valueIds[index] })),
            ]
          : last,
      [],
    );

export const insertValues = async (
  db: DatabasePoolConnectionType,
  netWorthId: string,
  values: ValueObject[] = [],
): Promise<void> => {
  if (!values.length) {
    return;
  }

  const valuesRows = values.map(getValueRow(netWorthId));

  const { rows: insertRows } = await db.query<{ id: string }>(sql`
      INSERT INTO net_worth_values (net_worth_id, skip, subcategory, value)
      SELECT * FROM ${sql.unnest(valuesRows, ['uuid', 'bool', 'uuid', 'int4'])}
      RETURNING id
    `);

  const valueIds: string[] = insertRows.map(({ id }) => id);

  const fxValuesRows = filterComplexValues<FXValue>(
    valueIds,
    getFxValues,
    values,
  ).map(({ valueId, value, currency }) => [valueId, value, currency]);

  const optionValuesRows = filterComplexValues<OptionValue>(
    valueIds,
    getOptionValues,
    values,
  ).map(({ valueId, units, strikePrice, marketPrice }) => [
    valueId,
    units,
    strikePrice,
    marketPrice,
  ]);

  await Promise.all([
    fxValuesRows.length
      ? db.query(sql`
          INSERT INTO net_worth_fx_values (values_id, value, currency)
          SELECT * FROM ${sql.unnest(fxValuesRows, ['uuid', 'float4', 'varchar'])}
        `)
      : null,
    optionValuesRows.length
      ? db.query(sql`
          INSERT INTO net_worth_option_values (values_id, units, strike_price, market_price)
          SELECT * FROM ${sql.unnest(optionValuesRows, ['uuid', 'float4', 'float4', 'float4'])}
        `)
      : null,
  ]);
};

const insertWithNetWorthId = <R extends {}>(
  table: string,
  keys: (keyof R)[],
  types: string[],
) => async (db: DatabasePoolConnectionType, netWorthId: string, rows: R[] = []): Promise<void> => {
  if (!rows.length) {
    return;
  }

  const rowsWithId = rows.map(row => [netWorthId, ...keys.map(key => row[key])]);
  const columns = [
    sql.identifier(['net_worth_id']),
    ...keys.map(key => sql.identifier([key as string])),
  ];

  await db.query(sql`
    INSERT INTO ${sql.identifier([table])} (${sql.join(columns, sql`, `)})
    SELECT * FROM ${sql.unnest(rowsWithId, ['uuid', ...types])}
  `);
};

export const insertCreditLimits = insertWithNetWorthId<CreditLimit>(
  'net_worth_credit_limit',
  ['subcategory', 'value'],
  ['uuid', 'float4'],
);

export const insertCurrencies = insertWithNetWorthId<Currency>(
  'net_worth_currencies',
  ['currency', 'rate'],
  ['varchar', 'float8'],
);

export const onCreate = authDbRoute(async (db, req, res) => {
  const { date, values, creditLimit, currencies } = req.body;

  const uid = req.user.uid;

  const {
    rows: [{ id: netWorthId }],
  } = await db.query(sql`
    INSERT INTO net_worth (uid, date)
    VALUES (${uid}, ${formatDate(date)})
    RETURNING id
  `);

  await insertValues(db, netWorthId, values);
  await insertCreditLimits(db, netWorthId, creditLimit);
  await insertCurrencies(db, netWorthId, currencies);

  const netWorth = await fetchById(db, netWorthId, uid);

  res.status(201).json(netWorth);
});
