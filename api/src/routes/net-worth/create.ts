import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { formatDate, fetchById } from './read';
import { ComplexValueItem, ValueObject, ValueRow, FXValueRow } from './types';

const getSimpleValues = (value: ComplexValueItem): value is number => typeof value === 'number';
const getComplexValues = (value: ComplexValueItem): value is Exclude<ComplexValueItem, number> =>
  typeof value !== 'number';

function getValueRow(netWorthId: string): (value: ValueObject) => ValueRow {
  return ({ subcategory, skip = null, value }): ValueRow => {
    const base = {
      net_worth_id: netWorthId,
      skip,
      subcategory,
    };

    if (!(value && Array.isArray(value))) {
      return { ...base, value };
    }

    const simpleValues: number[] = value.filter(getSimpleValues);

    if (!simpleValues.length) {
      return { ...base, value: null };
    }

    return {
      ...base,
      value: simpleValues.reduce((sum, item) => sum + item, 0),
    };
  };
}

function getFxValueRow(valueIds: string[]) {
  return (last: FXValueRow[], { value }: ValueObject, index: number): FXValueRow[] => {
    if (!(value && Array.isArray(value))) {
      return last;
    }

    const valueId = valueIds[index];

    return [
      ...last,
      ...value.filter(getComplexValues).map(({ value: fxValue, currency }) => ({
        values_id: valueId,
        value: fxValue,
        currency,
      })),
    ];
  };
}

export async function insertValues(netWorthId: string, values: ValueObject[] = []): Promise<void> {
  if (!values.length) {
    return;
  }

  const valuesRows: ValueRow[] = values.map(getValueRow(netWorthId));

  const valueIds: string[] = await db('net_worth_values')
    .insert(valuesRows)
    .returning('id');

  const fxValuesRows: FXValueRow[] = values.reduce(getFxValueRow(valueIds), []);

  await db('net_worth_fx_values').insert(fxValuesRows);
}

function insertWithNetWorthId(table: string) {
  return async (netWorthId: string, rows: object[] = []): Promise<void> => {
    if (!rows.length) {
      return;
    }

    const rowsWithId = rows.map(row => ({ net_worth_id: netWorthId, ...row }));

    await db.insert(rowsWithId).into(table);
  };
}

export const insertCreditLimits = insertWithNetWorthId('net_worth_credit_limit');

export const insertCurrencies = insertWithNetWorthId('net_worth_currencies');

export const onCreate = catchAsyncErrors(async (req, res) => {
  const { date, values, creditLimit, currencies } = req.body;

  const uid = req.user?.uid;

  const [netWorthId] = await db
    .insert({
      uid,
      date: formatDate(date),
    })
    .returning('id')
    .into('net_worth');

  await insertValues(netWorthId, values);
  await insertCreditLimits(netWorthId, creditLimit);
  await insertCurrencies(netWorthId, currencies);

  const netWorth = await fetchById(netWorthId, uid);

  res.status(201).json(netWorth);
});
