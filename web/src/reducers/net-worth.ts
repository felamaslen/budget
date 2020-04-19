import { createReducerObject } from 'create-reducer-object';
import compose from 'just-compose';
import { DateTime } from 'luxon';

import {
  NET_WORTH_CATEGORY_CREATED,
  NET_WORTH_CATEGORY_UPDATED,
  NET_WORTH_CATEGORY_DELETED,
  NET_WORTH_SUBCATEGORY_CREATED,
  NET_WORTH_SUBCATEGORY_UPDATED,
  NET_WORTH_SUBCATEGORY_DELETED,
  NET_WORTH_CREATED,
  NET_WORTH_UPDATED,
  NET_WORTH_DELETED,
} from '~client/constants/actions/net-worth';

import { LOGGED_OUT } from '~client/constants/actions/login';
import { DATA_READ, SYNC_RECEIVED } from '~client/constants/actions/api';

import { onCreateOptimistic, onUpdateOptimistic, onDeleteOptimistic } from '~client/reducers/crud';

import { CREATE, UPDATE, DELETE } from '~client/constants/data';
import { IDENTITY } from '~client/modules/data';

export const initialState = {
  categories: [],
  subcategories: [],
  entries: [],
};

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

const COLUMNS_CATEGORIES = ['category', 'color', 'type'];
const COLUMNS_SUBCATEGORIES = ['subcategory', 'categoryId', 'hasCreditLimit', 'opacity'];
const COLUMNS_ENTRIES = ['date', 'values', 'currencies', 'creditLimit'];

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

export default createReducerObject(handlers, initialState);
