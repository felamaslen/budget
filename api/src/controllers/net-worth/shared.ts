import boom from '@hapi/boom';
import { format } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getInvalidIds, getInvalidCreditCategories } from '~api/queries';
import {
  Entry,
  CreateEntry,
  ValueObject,
  Value,
  ComplexValueItem,
  ComplexValue,
  OptionValue,
  FXValue,
  CreditLimit,
  Currency,
  JoinedEntryRow,
  JoinedEntryRowWithCurrencies,
  JoinedEntryRowWithCreditLimit,
  JoinedEntryRowWithFXValue,
  JoinedEntryRowWithOptionValue,
} from '~api/types';

export const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const entryRowHasCurrencies = (
  rows: readonly JoinedEntryRow[],
): rows is JoinedEntryRowWithCurrencies[] => !!rows[0].currency_ids[0];

export const entryRowHasCreditLimit = (
  rows: readonly JoinedEntryRow[],
): rows is JoinedEntryRowWithCreditLimit[] => !!rows[0].credit_limit_subcategory[0];

export const entryRowHasFXValue = (row: JoinedEntryRow): row is JoinedEntryRowWithFXValue =>
  !!row.fx_currencies[0];

export const entryRowHasOptionValue = (row: JoinedEntryRow): row is JoinedEntryRowWithOptionValue =>
  row.op_units !== null;

export const isSimpleValue = (value: ComplexValueItem): value is number =>
  typeof value === 'number';
export const isComplexValue = (value?: Value | ComplexValue): value is ComplexValue =>
  !!value && Array.isArray(value);
export const isFXValue = (value: ComplexValueItem): value is FXValue =>
  typeof value !== 'number' && Reflect.has(value, 'currency');
export const isOptionValue = (value: ComplexValueItem): value is OptionValue =>
  typeof value !== 'number' && Reflect.has(value, 'strikePrice');

export function getValueFromRow(row: JoinedEntryRow): Value {
  if (entryRowHasFXValue(row)) {
    return row.fx_values.reduce<FXValue[]>(
      (fxValues, fxValue, index) => [
        ...fxValues,
        {
          value: fxValue,
          currency: row.fx_currencies[index],
        },
      ],
      [],
    );
  }
  if (entryRowHasOptionValue(row)) {
    return [
      {
        units: row.op_units,
        strikePrice: row.op_strike_price,
        marketPrice: row.op_market_price,
      },
    ];
  }
  return row.value_simple ?? 0;
}

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

export async function validateCategories(
  db: DatabaseTransactionConnectionType,
  data: CreateEntry,
): Promise<void> {
  const valuesCategories = data.values.map(({ subcategory }) => subcategory);
  const creditLimitCategories = data.creditLimit.map(({ subcategory }) => subcategory);

  const allSubCategories = [...valuesCategories, ...creditLimitCategories];

  const invalidIds = await getInvalidIds(db, allSubCategories);
  if (invalidIds.length) {
    throw boom.notFound(`Nonexistent subcategory IDs: ${invalidIds.map(({ id }) => id).join(',')}`);
  }

  const invalidCreditCategories = await getInvalidCreditCategories(db, creditLimitCategories);

  if (invalidCreditCategories.length) {
    throw boom.badRequest(
      `Tried to add credit limit to non-credit subcategory: ${invalidCreditCategories
        .map(({ id }) => id)
        .join(',')}`,
    );
  }

  if (Array.from(new Set(creditLimitCategories)).length !== creditLimitCategories.length) {
    throw boom.badRequest('Duplicate credit limit subcategories');
  }
}
