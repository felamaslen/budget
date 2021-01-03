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
  GQL,
  Id,
  NetWorthEntryNative as Entry,
  NetWorthEntryRead,
  NetWorthValueObjectNative,
  NetWorthValueObjectRead,
} from '~client/types';
import type {
  NetWorthCategory as Category,
  NetWorthSubcategory as Subcategory,
} from '~client/types/gql';

type ExtraState = {
  old: number[];
  oldOptions: number[];
};

export type State = {
  categories: GQL<Category>[];
  subcategories: GQL<Subcategory>[];
  entries: GQL<Entry>[];
} & ExtraState;

export const initialState: State = {
  categories: [],
  subcategories: [],
  entries: [],
  old: [],
  oldOptions: [],
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
  mortgage: value.mortgage ? omitTypeName(value.mortgage) : null,
});

const mapEntry = (entry: NetWorthEntryRead): Entry => ({
  id: entry.id,
  date: new Date(entry.date),
  values: entry.values.map(compose(omitComplexValueTypeNames, omitTypeName)),
  creditLimit: entry.creditLimit.map(omitTypeName),
  currencies: entry.currencies.map(omitTypeName),
});

const onRead = (
  state: State,
  {
    res: {
      netWorthCategories: categories,
      netWorthSubcategories: subcategories,
      netWorthEntries: entries,
    },
  }: ActionApiDataRead,
): State => ({
  ...state,
  categories: (categories ?? []).map(omitTypeName),
  subcategories: (subcategories ?? []).map(omitTypeName),
  entries: sortEntryValues(entries?.current.map<Entry>(mapEntry) ?? []),
  old: entries?.old ?? [],
  oldOptions: entries?.oldOptions ?? [],
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
