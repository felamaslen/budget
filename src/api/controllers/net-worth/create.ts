import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '../shared';

import { fetchById, readNetWorthCashTotal } from './read';
import { validateCategories } from './shared';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  insertEntry,
  insertValues,
  insertFXValues,
  insertLoanValues,
  insertOptionValues,
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
  LoanValueRow,
  OptionValueRow,
} from '~api/types';

function getRowValue(value: NetWorthValueInput): number | null {
  if (value.loan) {
    return -value.loan.principal;
  }

  return value.simple ?? null;
}

type ValueChildRows = {
  fx: FXValueRow[];
  options: OptionValueRow[];
  loan: LoanValueRow[];
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

function getLoanValuesRows(valueId: number, row: NetWorthValueInput): LoanValueRow[] {
  if (!row.loan) {
    return [];
  }

  const { paymentsRemaining, rate, paid = null } = row.loan;

  return [[valueId, paymentsRemaining, rate, paid]];
}

function getValueChildRows(valueIds: number[], values: NetWorthValueInput[]): ValueChildRows {
  return values.reduce<ValueChildRows>(
    ({ fx, options, loan }, row, index) => ({
      fx: [...fx, ...getFXValuesRows(valueIds[index], row)],
      options: [...options, ...getOptionValuesRows(valueIds[index], row)],
      loan: [...loan, ...getLoanValuesRows(valueIds[index], row)],
    }),
    {
      fx: [],
      options: [],
      loan: [],
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
    insertLoanValues(db, valueChildRows.loan),
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
    ['text', 'float8'],
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

  const [item, cashTotal] = await Promise.all([
    fetchById(db, uid, netWorthId),
    readNetWorthCashTotal(db, uid),
  ]);
  await pubsub.publish(`${PubSubTopic.NetWorthEntryCreated}.${uid}`, { item });
  await pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);

  return { id: netWorthId };
}
