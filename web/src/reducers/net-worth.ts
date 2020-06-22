import { compose } from '@typed/compose';

import {
  Action,
  ActionTypeNetWorth,
  ActionTypeLogin,
  ActionTypeApi,
  ActionApiDataRead,
  ActionApiSyncReceived,
} from '~client/actions';
import { sortByKey } from '~client/modules/data';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
  withCreatedIds,
  withCreates,
  withUpdates,
  withDeletes,
} from '~client/reducers/crud';
import {
  Category,
  Subcategory,
  Entry,
  CreditLimit,
  ValueObject,
  SyncRequestNetWorth as SyncRequest,
} from '~client/types';

type ExtraState = {
  old: number[];
  oldOptions: number[];
};

export type State = {
  categories: CrudState<Category>;
  subcategories: CrudState<Subcategory>;
  entries: CrudState<Entry>;
} & ExtraState;

export const initialState: State = {
  categories: { items: [], __optimistic: [] },
  subcategories: { items: [], __optimistic: [] },
  entries: { items: [], __optimistic: [] },
  old: [],
  oldOptions: [],
};

const removeDeletedSubcategories = (state: State): State => ({
  ...state,
  subcategories: state.subcategories.items.reduce<CrudState<Subcategory>>(
    (last, subcategory, index) =>
      state.categories.items.some(({ id }) => id === subcategory.categoryId)
        ? {
            items: [...last.items, subcategory],
            __optimistic: [...last.__optimistic, state.subcategories.__optimistic[index]],
          }
        : last,
    initialState.subcategories,
  ),
});

const removeDeletedEntries = (state: State): State => ({
  ...state,
  entries: {
    __optimistic: state.entries.__optimistic,
    items: state.entries.items.map<Entry>(({ values, creditLimit, ...rest }) => ({
      ...rest,
      values: values.filter(({ subcategory }) =>
        state.subcategories.items.some(({ id }) => id === subcategory),
      ),
      creditLimit: creditLimit.filter(({ subcategory }: CreditLimit) =>
        state.subcategories.items.some(({ id }) => id === subcategory),
      ),
    })),
  },
});

const removeDependencies = (state: State): State =>
  compose(removeDeletedEntries, removeDeletedSubcategories)(state);

const sortIndividualEntryValues = sortByKey<'subcategory', ValueObject>({
  key: 'subcategory',
  order: 1,
});

const sortEntryValues = (entries: CrudState<Entry>): CrudState<Entry> => ({
  __optimistic: entries.__optimistic,
  items: entries.items.map((entry) => ({
    ...entry,
    values: sortIndividualEntryValues(entry.values),
  })),
});

const onRead = (
  state: State,
  {
    res: {
      netWorth: { categories, subcategories, entries },
    },
  }: ActionApiDataRead,
): State => ({
  ...state,
  categories: {
    items: categories.data,
    __optimistic: categories.data.map(() => undefined),
  },
  subcategories: {
    items: subcategories.data,
    __optimistic: subcategories.data.map(() => undefined),
  },
  entries: sortEntryValues({
    items: entries.data.items.map<Entry>(
      ({ date, values = [], creditLimit = [], currencies = [], ...rest }) => ({
        date: new Date(date),
        values: sortByKey<'id', ValueObject>('id')(values),
        creditLimit,
        currencies,
        ...rest,
      }),
    ),
    __optimistic: entries.data.items.map(() => undefined),
  }),
  old: entries.data.old ?? [],
  oldOptions: entries.data.oldOptions ?? [],
});

const updateEntriesOnSubcategoryCreate = (requests: SyncRequest[]) => (
  entries: CrudState<Entry>,
): CrudState<Entry> => ({
  __optimistic: entries.__optimistic,
  items: entries.items.map<Entry>((entry) => ({
    ...entry,
    values: withCreatedIds(requests, 'subcategory', entry.values),
    creditLimit: withCreatedIds(requests, 'subcategory', entry.creditLimit),
  })),
});

const confirmCreates = (requests: SyncRequest[]) => (state: State): State => ({
  ...state,
  categories: withCreates<Category>(requests)(state.categories),
  subcategories: compose<CrudState<Subcategory>, CrudState<Subcategory>, CrudState<Subcategory>>(
    withCreates(requests, 'categoryId', false),
    withCreates<Subcategory>(requests),
  )(state.subcategories),
  entries: compose<CrudState<Entry>, CrudState<Entry>, CrudState<Entry>, CrudState<Entry>>(
    sortEntryValues,
    updateEntriesOnSubcategoryCreate(requests),
    withCreates<Entry>(requests),
  )(state.entries),
});

const confirmUpdates = (requests: SyncRequest[]) => (state: State): State => ({
  ...state,
  categories: withUpdates<Category>(requests)(state.categories),
  subcategories: withUpdates<Subcategory>(requests)(state.subcategories),
  entries: withUpdates<Entry>(requests)(state.entries),
});

const confirmDeletes = (requests: SyncRequest[]) => (state: State): State =>
  removeDependencies({
    ...state,
    categories: withDeletes<Category>(requests)(state.categories),
    subcategories: withDeletes<Subcategory>(requests)(state.subcategories),
    entries: withDeletes<Entry>(requests)(state.entries),
  });

const onSyncReceived = (
  state: State,
  { res: { netWorth: requests = [] } }: ActionApiSyncReceived,
): State =>
  compose(confirmCreates(requests), confirmUpdates(requests), confirmDeletes(requests))(state);

export default function netWorth(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeNetWorth.CategoryCreated:
      return {
        ...state,
        categories: onCreateOptimistic(state.categories, action.fakeId, action.item),
      };
    case ActionTypeNetWorth.CategoryUpdated:
      return { ...state, categories: onUpdateOptimistic(state.categories, action.id, action.item) };
    case ActionTypeNetWorth.CategoryDeleted:
      return removeDependencies({
        ...state,
        categories: onDeleteOptimistic(state.categories, action.id),
      });

    case ActionTypeNetWorth.SubcategoryCreated:
      return {
        ...state,
        subcategories: onCreateOptimistic(state.subcategories, action.fakeId, action.item),
      };
    case ActionTypeNetWorth.SubcategoryUpdated:
      return {
        ...state,
        subcategories: onUpdateOptimistic(state.subcategories, action.id, action.item),
      };
    case ActionTypeNetWorth.SubcategoryDeleted:
      return removeDependencies({
        ...state,
        subcategories: onDeleteOptimistic(state.subcategories, action.id),
      });

    case ActionTypeNetWorth.EntryCreated:
      return { ...state, entries: onCreateOptimistic(state.entries, action.fakeId, action.item) };
    case ActionTypeNetWorth.EntryUpdated:
      return {
        ...state,
        entries: onUpdateOptimistic(state.entries, action.id, action.item),
      };
    case ActionTypeNetWorth.EntryDeleted:
      return { ...state, entries: onDeleteOptimistic(state.entries, action.id) };

    case ActionTypeApi.DataRead:
      return onRead(state, action);
    case ActionTypeApi.SyncReceived:
      return action.res.netWorth.length ? onSyncReceived(state, action) : state;

    case ActionTypeLogin.LoggedOut:
      return initialState;
    default:
      return state;
  }
}
