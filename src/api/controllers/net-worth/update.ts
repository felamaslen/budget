import deepEqual from 'fast-deep-equal';
import { DatabaseTransactionConnectionType } from 'slonik';

import { formatDate } from '../shared';
import { createValues, createCreditLimits, createCurrencies } from './create';
import { fetchById, readNetWorthCashTotal } from './read';
import { validateCategories } from './shared';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import {
  updateEntryDate,
  deleteOldValues,
  deleteOldCreditLimit,
  deleteOldCurrencies,
  deleteChangedFXValues,
  deleteChangedOptionValues,
  deleteChangedLoanValues,
} from '~api/queries';
import { MutationUpdateNetWorthEntryArgs, CrudResponseUpdate } from '~api/types';

export async function updateNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id: netWorthId, input }: MutationUpdateNetWorthEntryArgs,
): Promise<CrudResponseUpdate> {
  await validateCategories(db, input);
  const { date, values, creditLimit, currencies } = input;
  const entryBefore = await fetchById(db, uid, netWorthId);

  const deletedValues = entryBefore.values
    .filter((oldValue) => !values.some(({ subcategory }) => subcategory === oldValue.subcategory))
    .map(({ subcategory }) => subcategory);

  const deletedCreditLimit = entryBefore.creditLimit
    .filter(
      (oldValue) => !creditLimit.some(({ subcategory }) => subcategory === oldValue.subcategory),
    )
    .map(({ subcategory }) => subcategory);

  const deletedCurrencies = entryBefore.currencies
    .filter((oldValue) => !currencies.some(({ currency }) => currency === oldValue.currency))
    .map(({ currency }) => currency);

  const changedValues = values
    .filter((newValue) => !entryBefore.values.some((oldValue) => deepEqual(oldValue, newValue)))
    .map(({ subcategory }) => subcategory);

  const allSubcategories = values.map(({ subcategory }) => subcategory);

  await Promise.all([
    updateEntryDate(db, uid, netWorthId, formatDate(date)),
    deleteOldValues(db, uid, netWorthId, deletedValues),
    deleteOldCreditLimit(db, uid, netWorthId, deletedCreditLimit),
    deleteOldCurrencies(db, uid, netWorthId, deletedCurrencies),
    deleteChangedFXValues(db, uid, netWorthId, changedValues),
    deleteChangedOptionValues(db, uid, netWorthId, allSubcategories),
    deleteChangedLoanValues(db, uid, netWorthId, allSubcategories),
  ]);

  await Promise.all([
    createValues(db, netWorthId, values),
    createCreditLimits(db, netWorthId, creditLimit),
    createCurrencies(db, netWorthId, currencies),
  ]);

  const [item, cashTotal] = await Promise.all([
    fetchById(db, uid, netWorthId),
    readNetWorthCashTotal(db, uid),
  ]);
  await pubsub.publish(`${PubSubTopic.NetWorthEntryUpdated}.${uid}`, { item });
  await pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);

  return { error: null };
}
