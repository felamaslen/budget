import { compose } from '@typed/compose';
import { replaceAtIndex } from 'replace-array';

import {
  Action,
  ActionTypeNetWorth,
  ActionTypeLogin,
  ActionTypeApi,
  ActionApiDataRead,
} from '~client/actions';
import { omitTypeName, sortByKey } from '~client/modules/data';
import type {
  CashTotalNative,
  Id,
  NetWorthEntryNative as Entry,
  NetWorthEntryRead,
  NetWorthValueObjectNative,
  NetWorthValueObjectRead,
} from '~client/types';
import type {
  NetWorthCashTotal,
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';
import type { GQL } from '~shared/types';

export type State = {
  categories: GQL<Category>[];
  subcategories: GQL<Subcategory>[];
  entries: GQL<Entry>[];
  cashTotal: CashTotalNative;
};

export const initialState: State = {
  categories: [],
  subcategories: [],
  entries: [],
  cashTotal: {
    cashInBank: 0,
    stockValue: 0,
    stocksIncludingCash: 0,
    date: null,
  },
};

const removeDeletedSubcategories = (state: State): State => ({
  ...state,
  subcategories: state.subcategories.filter(({ categoryId }) =>
    state.categories.some(({ id }) => id === categoryId),
  ),
});

const removeDeletedEntries = (state: State): State => ({
  ...state,
  entries: state.entries.map<Entry>((entry) => ({
    ...entry,
    values: entry.values.filter(({ subcategory }) =>
      state.subcategories.some(({ id }) => id === subcategory),
    ),
    creditLimit: entry.creditLimit.filter(({ subcategory }) =>
      state.subcategories.some(({ id }) => id === subcategory),
    ),
  })),
});

const removeDependencies = compose(removeDeletedEntries, removeDeletedSubcategories);

const sortIndividualEntryValues = sortByKey<'subcategory', Entry['values'][0]>({
  key: 'subcategory',
  order: 1,
});

const sortEntryValues = (entries: Entry[]): Entry[] =>
  entries.map<Entry>((entry) => ({
    ...entry,
    values: sortIndividualEntryValues(entry.values),
  }));

const omitComplexValueTypeNames = (value: NetWorthValueObjectRead): NetWorthValueObjectNative => ({
  ...value,
  fx: value.fx?.map(omitTypeName) ?? null,
  option: value.option ? omitTypeName(value.option) : null,
  loan: value.loan ? omitTypeName(value.loan) : null,
});

const mapEntry = (entry: NetWorthEntryRead): Entry => ({
  id: entry.id,
  date: new Date(entry.date),
  values: entry.values.map(compose(omitComplexValueTypeNames, omitTypeName)),
  creditLimit: entry.creditLimit.map(omitTypeName),
  currencies: entry.currencies.map(omitTypeName),
});

const withCashTotals = (state: State, cashTotals?: GQL<NetWorthCashTotal> | null): State =>
  cashTotals
    ? {
        ...state,
        cashTotal: {
          cashInBank: cashTotals.cashInBank,
          stockValue: cashTotals.stockValue,
          stocksIncludingCash: cashTotals.stocksIncludingCash,
          date: cashTotals.date ? new Date(cashTotals.date) : null,
        },
      }
    : state;

const onRead = (
  state: State,
  {
    res: {
      netWorthCategories: categories,
      netWorthSubcategories: subcategories,
      netWorthEntries: entries,
      netWorthCashTotal,
    },
  }: ActionApiDataRead,
): State => ({
  ...withCashTotals(state, netWorthCashTotal),
  categories: categories ? categories.map(omitTypeName) : state.categories,
  subcategories: subcategories ? subcategories.map(omitTypeName) : state.subcategories,
  entries: entries ? sortEntryValues(entries.current.map<Entry>(mapEntry)) : state.entries,
});

function simpleUpdate<
  K extends 'categories' | 'subcategories' | 'entries',
  A extends { item: State[K][0] }
>(key: K, state: State, action: A): State {
  return {
    ...state,
    [key]: replaceAtIndex<State[K][0]>(
      state[key],
      state[key].findIndex(({ id }: { id: Id }) => id === action.item.id),
      action.item,
    ),
  };
}

export default function netWorth(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeNetWorth.CategoryCreated:
      return { ...state, categories: [...state.categories, action.item] };
    case ActionTypeNetWorth.CategoryUpdated:
      return simpleUpdate('categories', state, action);
    case ActionTypeNetWorth.CategoryDeleted:
      return removeDependencies({
        ...state,
        categories: state.categories.filter(({ id }) => id !== action.id),
      });

    case ActionTypeNetWorth.SubcategoryCreated:
      return { ...state, subcategories: [...state.subcategories, action.item] };
    case ActionTypeNetWorth.SubcategoryUpdated:
      return simpleUpdate('subcategories', state, action);
    case ActionTypeNetWorth.SubcategoryDeleted:
      return removeDependencies({
        ...state,
        subcategories: state.subcategories.filter(({ id }) => id !== action.id),
      });

    case ActionTypeNetWorth.EntryCreated:
      return { ...state, entries: [...state.entries, mapEntry(action.item)] };
    case ActionTypeNetWorth.EntryUpdated:
      return {
        ...state,
        entries: replaceAtIndex<Entry>(
          state.entries,
          state.entries.findIndex(({ id }) => id === action.item.id),
          mapEntry(action.item),
        ),
      };
    case ActionTypeNetWorth.EntryDeleted:
      return { ...state, entries: state.entries.filter(({ id }) => id !== action.id) };

    case ActionTypeApi.DataRead:
      return onRead(state, action);

    case ActionTypeLogin.LoggedOut:
      return initialState;
    default:
      return state;
  }
}
