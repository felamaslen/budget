import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '../shared';

import { fetchById } from './read';
import { validateCategories } from './shared';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  insertEntry,
  insertValues,
  insertFXValues,
  insertOptionValues,
  insertMortgageValues,
  insertWithNetWorthId,
} from '~api/queries';
import {
  Currency,
  CreditLimit,
  MutationCreateNetWorthEntryArgs,
  CrudResponseCreate,
  NetWorthValueInput,
  ValueRow,
  FXValueRow,
  OptionValueRow,
  MortgageValueRow,
} from '~api/types';

function getRowValue(value: NetWorthValueInput): number | null {
  if (value.mortgage) {
    return -value.mortgage.principal;
  }

  return value.simple ?? null;
}

type ValueChildRows = {
  fx: FXValueRow[];
  options: OptionValueRow[];
  mortgage: MortgageValueRow[];
};

function getFXValuesRows(valueId: number, row: NetWorthValueInput): FXValueRow[] {
  if (!row.fx) {
    return [];
  }

  return row.fx.reduce<FXValueRow[]>(
    (last, { value, currency }) => [...last, [valueId, value, currency]],
    [],
  );
}

function getOptionValuesRows(valueId: number, row: NetWorthValueInput): OptionValueRow[] {
  if (!row.option) {
    return [];
  }

  const { units, marketPrice, strikePrice, vested } = row.option;

  return [[valueId, units, strikePrice, marketPrice, vested ?? 0]];
}

function getMortgageValuesRows(valueId: number, row: NetWorthValueInput): MortgageValueRow[] {
  if (!row.mortgage) {
    return [];
  }

  const { paymentsRemaining, rate } = row.mortgage;

  return [[valueId, paymentsRemaining, rate]];
}

function getValueChildRows(valueIds: number[], values: NetWorthValueInput[]): ValueChildRows {
  return values.reduce<ValueChildRows>(
    ({ fx, options, mortgage }, row, index) => ({
      fx: [...fx, ...getFXValuesRows(valueIds[index], row)],
      options: [...options, ...getOptionValuesRows(valueIds[index], row)],
      mortgage: [...mortgage, ...getMortgageValuesRows(valueIds[index], row)],
    }),
    {
      fx: [],
      options: [],
      mortgage: [],
    },
  );
}

export async function createValues(
  db: DatabaseTransactionConnectionType,
  netWorthId: number,
  values: NetWorthValueInput[],
): Promise<void> {
  if (!values.length) {
    return;
  }

  const valueIds = await insertValues(
    db,
    values.map<ValueRow>((value) => [
      netWorthId,
      value.skip ?? null,
      value.subcategory,
      getRowValue(value),
    ]),
  );

  const valueChildRows = getValueChildRows(valueIds, values);

  await Promise.all([
    insertFXValues(db, valueChildRows.fx),
    insertOptionValues(db, valueChildRows.options),
    insertMortgageValues(db, valueChildRows.mortgage),
  ]);
}

export async function createCreditLimits(
  db: DatabaseTransactionConnectionType,
  netWorthId: number,
  creditLimit: CreditLimit[],
): Promise<void> {
  await insertWithNetWorthId<CreditLimit>(
    db,
    'net_worth_credit_limit',
    ['subcategory', 'value'],
    ['int4', 'float4'],
    netWorthId,
    creditLimit,
  );
}

export async function createCurrencies(
  db: DatabaseTransactionConnectionType,
  netWorthId: number,
  currencies: Currency[],
): Promise<void> {
  await insertWithNetWorthId<Currency>(
    db,
    'net_worth_currencies',
    ['currency', 'rate'],
    ['varchar', 'float8'],
    netWorthId,
    currencies,
  );
}

export async function createNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { input }: MutationCreateNetWorthEntryArgs,
): Promise<CrudResponseCreate> {
  await validateCategories(db, input);
  const { date, values, creditLimit, currencies } = input;
  const netWorthId = await insertEntry(db, uid, formatDate(date));

  await Promise.all([
    createValues(db, netWorthId, values),
    createCreditLimits(db, netWorthId, creditLimit),
    createCurrencies(db, netWorthId, currencies),
  ]);

  const item = await fetchById(db, uid, netWorthId);
  await pubsub.publish(`${PubSubTopic.NetWorthEntryCreated}.${uid}`, { item });

  return { id: netWorthId };
}
