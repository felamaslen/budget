import deepEqual from 'fast-deep-equal';
import { DatabaseTransactionConnectionType } from 'slonik';

import { createValues, createCreditLimits, createCurrencies } from './create';
import { fetchById } from './read';
import { formatDate, validateCategories } from './shared';
import {
  updateEntryDate,
  deleteOldValues,
  deleteOldCreditLimit,
  deleteOldCurrencies,
  deleteChangedFXValues,
  deleteChangedOptionValues,
} from '~api/queries';
import { CreateEntry, Entry } from '~api/types';

export async function updateNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
  data: CreateEntry,
): Promise<Entry> {
  await validateCategories(db, data);
  const { date, values, creditLimit, currencies } = data;
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
    .filter(
      (newValue) =>
        !entryBefore.values.some(({ id: oldId, ...oldValue }) => deepEqual(oldValue, newValue)),
    )
    .map(({ subcategory }) => subcategory);

  const allSubcategories = values.map(({ subcategory }) => subcategory);

  await Promise.all([
    updateEntryDate(db, uid, netWorthId, formatDate(date)),
    deleteOldValues(db, uid, netWorthId, deletedValues),
    deleteOldCreditLimit(db, uid, netWorthId, deletedCreditLimit),
    deleteOldCurrencies(db, uid, netWorthId, deletedCurrencies),
    deleteChangedFXValues(db, uid, netWorthId, changedValues),
    deleteChangedOptionValues(db, uid, netWorthId, allSubcategories),
  ]);

  await Promise.all([
    createValues(db, netWorthId, values),
    createCreditLimits(db, netWorthId, creditLimit),
    createCurrencies(db, netWorthId, currencies),
  ]);

  const entry = await fetchById(db, uid, netWorthId);
  return entry;
}
