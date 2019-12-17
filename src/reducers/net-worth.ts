import { combineReducers } from 'redux';
import compose from '@typed/compose';

import { ExcludeOne } from '~/types/utils';
import { OptimisticItem } from '~/types/crud';
import {
  Category,
  Subcategory,
  Entry,
  OptimisticCategory,
  OptimisticSubcategory,
  OptimisticEntry,
} from '~/types/net-worth';
import createReducer from '~/reducers/create-reducer';

import {
  NET_WORTH_READ,
  NET_WORTH_CATEGORY_CREATED,
  NET_WORTH_CATEGORY_UPDATED,
  NET_WORTH_CATEGORY_DELETED,
  NET_WORTH_SUBCATEGORY_CREATED,
  NET_WORTH_SUBCATEGORY_UPDATED,
  NET_WORTH_SUBCATEGORY_DELETED,
  NET_WORTH_ENTRY_CREATED,
  NET_WORTH_ENTRY_UPDATED,
  NET_WORTH_ENTRY_DELETED,
} from '~/constants/actions.rt';

import {
  crudReducer,
  CrudState,
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
} from '~/modules/crud';
import { CREATE, UPDATE, DELETE } from '~/constants/crud';
import { identity } from '~/modules/utils';

type ColumnCategory = keyof ExcludeOne<Category, 'id'>;
type ColumnSubcategory = keyof ExcludeOne<Subcategory, 'id'>;
type ColumnEntry = keyof ExcludeOne<Entry, 'id'>;

const COLUMNS_CATEGORIES: ColumnCategory[] = ['category', 'color', 'type'];
const COLUMNS_SUBCATEGORIES: ColumnSubcategory[] = [
  'subcategory',
  'categoryId',
  'hasCreditLimit',
  'opacity',
];
const COLUMNS_ENTRIES: ColumnEntry[] = ['date', 'values', 'currencies', 'creditLimit'];

export type State = {
  categories: {
    items: OptimisticCategory[];
  };
  subcategories: {
    items: OptimisticSubcategory[];
  };
  entries: {
    items: OptimisticEntry[];
  };
};

/*
const withDates = item => {
  if (item.date) {
    return { ...item, date: DateTime.fromISO(item.date) };
  }

  return item;
};

const mapChanges = (requestType, idKey = 'id') => (requests, postProcess = IDENTITY) => item => {
  if (item.__optimistic !== requestType) {
    return item;
  }

  const changed = requests.find(({ type, [idKey]: id }) => type === requestType && id === item.id);
  if (!changed) {
    return item;
  }

  return postProcess({ ...changed.res, __optimistic: null });
};

const mapCreates = mapChanges(CREATE, 'fakeId');

const mapEntryItems = processor => ({ values, creditLimit, ...rest }) => ({
  ...rest,
  values: processor(values),
  creditLimit: processor(creditLimit),
});

const mapCreatedCategory = requests => subcategory => {
  const created = requests.find(
    ({ type, fakeId }) => type === CREATE && fakeId === subcategory.categoryId,
  );

  if (!created) {
    return subcategory;
  }

  return { ...subcategory, categoryId: created.res.id };
};

const mapCreatedSubcategory = requests =>
  mapEntryItems(items =>
    items.map(entryItem => {
      const created = requests.find(
        ({ type, fakeId }) => type === CREATE && fakeId === entryItem.subcategory,
      );

      if (!created) {
        return entryItem;
      }

      return { ...entryItem, subcategory: created.res.id };
    }),
  );

const withCreates = requests => state => ({
  ...state,
  categories: state.categories.map(mapCreates(requests)),
  subcategories: state.subcategories.map(mapCreates(requests)).map(mapCreatedCategory(requests)),
  entries: state.entries.map(mapCreates(requests, withDates)).map(mapCreatedSubcategory(requests)),
});

const mapUpdates = mapChanges(UPDATE);

const withUpdates = requests => state => ({
  ...state,
  categories: state.categories.map(mapUpdates(requests)),
  subcategories: state.subcategories.map(mapUpdates(requests)),
  entries: state.entries.map(mapUpdates(requests, withDates)),
});

const filterDeletes = requests => ({ id, __optimistic }) =>
  !(
    __optimistic === DELETE &&
    requests.some(({ type, id: deletedId }) => type === DELETE && deletedId === id)
  );

const deleteCategories = requests => state => ({
  ...state,
  categories: state.categories.filter(filterDeletes(requests)),
});

const deleteSubcategories = requests => state => ({
  ...state,
  subcategories: state.subcategories
    .filter(filterDeletes(requests))
    .filter(({ categoryId }) => state.categories.some(({ id }) => id === categoryId)),
});

const deleteEntries = requests => state => ({
  ...state,
  entries: state.entries
    .filter(filterDeletes(requests))
    .map(
      mapEntryItems(items =>
        items.filter(({ subcategory }) => state.subcategories.some(({ id }) => id === subcategory)),
      ),
    ),
});

const withDeletes = requests => state =>
  compose(
    deleteCategories(requests),
    deleteSubcategories(requests),
    deleteEntries(requests),
  )(state);

const onRead = (
  state,
  {
    res: {
      netWorth: { categories, subcategories, entries },
    },
  },
) => ({
  categories: categories.data,
  subcategories: subcategories.data,
  entries: entries.data.items.map(
    ({ date, values = [], creditLimit = [], currencies = [], ...rest }) => ({
      date: DateTime.fromISO(date),
      values,
      creditLimit,
      currencies,
      ...rest,
    }),
  ),
  old: entries.data.old || [],
});

const onSyncReceived = (state, { res: { netWorth: requests = [] } }) =>
  compose(withCreates(requests), withUpdates(requests), withDeletes(requests))(state);

const removeDeletedSubcategories = ({ subcategories, ...state }) => ({
  ...state,
  subcategories: subcategories.filter(({ categoryId }) =>
    state.categories.some(({ id }) => id === categoryId),
  ),
});

const removeDeletedEntries = ({ entries, ...state }) => ({
  ...state,
  entries: entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ subcategory }) =>
      state.subcategories.some(({ id }) => id === subcategory),
    ),
  })),
});

const removeDependencies = handler => (state, action) =>
  compose(
    removeDeletedSubcategories,
    removeDeletedEntries,
  )({ ...state, ...handler(state, action) });

const handlers = {
  [LOGGED_OUT]: () => initialState,
  [NET_WORTH_CATEGORY_CREATED]: onCreateOptimistic('categories', COLUMNS_CATEGORIES),
  [NET_WORTH_CATEGORY_UPDATED]: onUpdateOptimistic('categories', COLUMNS_CATEGORIES),
  [NET_WORTH_CATEGORY_DELETED]: removeDependencies(onDeleteOptimistic('categories')),
  [NET_WORTH_SUBCATEGORY_CREATED]: onCreateOptimistic('subcategories', COLUMNS_SUBCATEGORIES),
  [NET_WORTH_SUBCATEGORY_UPDATED]: onUpdateOptimistic('subcategories', COLUMNS_SUBCATEGORIES),
  [NET_WORTH_SUBCATEGORY_DELETED]: removeDependencies(onDeleteOptimistic('subcategories')),
  [NET_WORTH_CREATED]: onCreateOptimistic('entries', COLUMNS_ENTRIES),
  [NET_WORTH_UPDATED]: onUpdateOptimistic('entries', COLUMNS_ENTRIES),
  [NET_WORTH_DELETED]: onDeleteOptimistic('entries'),
  [DATA_READ]: onRead,
  [SYNC_RECEIVED]: onSyncReceived,
};
*/

const categories = crudReducer<Category>({
  handlers: {
    [NET_WORTH_CATEGORY_CREATED]: {
      onSend: onCreateOptimistic<Category>(COLUMNS_CATEGORIES),
    },
    [NET_WORTH_CATEGORY_UPDATED]: {
      onSend: onUpdateOptimistic<Category>(),
    },
    [NET_WORTH_CATEGORY_DELETED]: {
      onSend: onDeleteOptimistic<Category>(),
    },
  },
});

const subcategories = crudReducer<Subcategory>({
  handlers: {
    //   [NET_WORTH_SUBCATEGORY_CREATED]: {
    //     onSend: onCreateOptimistic<Subcategory, ColumnSubcategory>(COLUMNS_SUBCATEGORIES),
    //   },
  },
});

const entries = crudReducer<Entry>({
  handlers: {
    //   [NET_WORTH_ENTRY_CREATED]: {
    //     onSend: onCreateOptimistic<Entry, ColumnEntry>(COLUMNS_ENTRIES),
    //   },
  },
});

export const initialState: State = {
  categories: categories.initialState,
  subcategories: subcategories.initialState,
  entries: entries.initialState,
};

const netWorthReducer = combineReducers<State>({
  categories: categories.reducer,
  subcategories: subcategories.reducer,
  entries: entries.reducer,
});
// [NET_WORTH_CATEGORY_UPDATED]: onUpdateOptimistic('categories', COLUMNS_CATEGORIES),
// [NET_WORTH_CATEGORY_DELETED]: removeDependencies(onDeleteOptimistic('categories')),
// [NET_WORTH_SUBCATEGORY_CREATED]: onCreateOptimistic('subcategories', COLUMNS_SUBCATEGORIES),
// [NET_WORTH_SUBCATEGORY_UPDATED]: onUpdateOptimistic('subcategories', COLUMNS_SUBCATEGORIES),
// [NET_WORTH_SUBCATEGORY_DELETED]: removeDependencies(onDeleteOptimistic('subcategories')),
// [NET_WORTH_CREATED]: onCreateOptimistic('entries', COLUMNS_ENTRIES),
// [NET_WORTH_UPDATED]: onUpdateOptimistic('entries', COLUMNS_ENTRIES),
// [NET_WORTH_DELETED]: onDeleteOptimistic('entries'),
// [DATA_READ]: onRead,
// [SYNC_RECEIVED]: onSyncReceived,

export default netWorthReducer;

export { netWorthReducer as reducer };
