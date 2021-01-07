import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getInvalidIds, getInvalidCreditCategories } from '~api/queries';
import {
  FxValue,
  MortgageValue,
  OptionValue,
  CreditLimit,
  Currency,
  JoinedEntryRow,
  JoinedEntryRowWithCurrencies,
  JoinedEntryRowWithCreditLimit,
  JoinedEntryRowWithFXValue,
  JoinedEntryRowWithOptionValue,
  JoinedEntryRowWithMortgageValue,
  NetWorthEntryInput,
  NetWorthValueObject,
  NetWorthEntry,
} from '~api/types';

const entryRowHasCurrencies = (
  rows: readonly JoinedEntryRow[],
): rows is JoinedEntryRowWithCurrencies[] => !!rows[0].currency_ids[0];

const entryRowHasCreditLimit = (
  rows: readonly JoinedEntryRow[],
): rows is JoinedEntryRowWithCreditLimit[] => !!rows[0].credit_limit_subcategory[0];

const entryRowHasFXValue = (row: JoinedEntryRow): row is JoinedEntryRowWithFXValue =>
  !!row.fx_currencies[0];

const entryRowHasOptionValue = (row: JoinedEntryRow): row is JoinedEntryRowWithOptionValue =>
  row.op_units !== null;

const entryRowHasMortgageValue = (row: JoinedEntryRow): row is JoinedEntryRowWithMortgageValue =>
  row.mortgage_payments_remaining !== null;

function sumFXValues(row: JoinedEntryRow): number {
  if (!entryRowHasFXValue(row)) {
    return 0;
  }
  return row.fx_values.reduce<number>((last, value, index) => {
    const currency = row.fx_currencies[index];
    const currencyIndex = row.currencies.findIndex(
      (compare: string | null) => compare === currency,
    );
    const currencyRate = row.currency_rates[currencyIndex];

    return last + value * 100 * (currencyRate ?? 0);
  }, 0);
}

function sumOptionValues(row: JoinedEntryRow): number {
  if (!entryRowHasOptionValue(row)) {
    return 0;
  }
  if (row.is_saye) {
    return row.op_vested * Math.max(row.op_market_price, row.op_strike_price);
  }
  return row.op_vested * Math.max(0, row.op_market_price - row.op_strike_price);
}

function sumValueFromRow(row: JoinedEntryRow): number {
  return Math.round((row.value_simple ?? 0) + sumFXValues(row) + sumOptionValues(row));
}

const getRowSimple = (row: JoinedEntryRow): number | null =>
  entryRowHasMortgageValue(row) ? null : row.value_simple ?? null;

const getRowFX = (row: JoinedEntryRowWithFXValue): FxValue[] =>
  row.fx_values.map<FxValue>((value, index) => ({
    value,
    currency: row.fx_currencies[index],
  }));

const getRowOption = (row: JoinedEntryRowWithOptionValue): OptionValue => ({
  units: row.op_units,
  vested: row.op_vested,
  strikePrice: row.op_strike_price,
  marketPrice: row.op_market_price,
});

const getRowMortgage = (row: JoinedEntryRowWithMortgageValue): MortgageValue => ({
  principal: -row.value_simple,
  rate: row.mortgage_rate,
  paymentsRemaining: row.mortgage_payments_remaining,
});

export function combineJoinedEntryRows(entryRows: readonly JoinedEntryRow[]): NetWorthEntry {
  if (!entryRows.length) {
    throw boom.notFound('Net worth entry not found');
  }

  const currencies = entryRowHasCurrencies(entryRows)
    ? entryRows[0].currency_ids.reduce<Currency[]>(
        (last, _, index) => [
          ...last,
          {
            currency: entryRows[0].currencies[index],
            rate: entryRows[0].currency_rates[index],
          },
        ],
        [],
      )
    : [];

  const values = entryRows.reduce<NetWorthValueObject[]>((last, row) => {
    const valueObject: NetWorthValueObject = {
      subcategory: row.value_subcategory,
      skip: row.value_skip,
      value: sumValueFromRow(row),
      simple: getRowSimple(row),
      fx: entryRowHasFXValue(row) ? getRowFX(row) : null,
      option: entryRowHasOptionValue(row) ? getRowOption(row) : null,
      mortgage: entryRowHasMortgageValue(row) ? getRowMortgage(row) : null,
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
    date: new Date(entryRows[0].date),
    currencies,
    values,
    creditLimit,
  };
}

export async function validateCategories(
  db: DatabaseTransactionConnectionType,
  data: NetWorthEntryInput,
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
