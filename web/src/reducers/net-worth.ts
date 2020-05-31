import { compose } from '@typed/compose';

import {
  Action,
  ActionTypeNetWorth,
  ActionTypeLogin,
  ActionTypeApi,
  ActionApiDataRead,
  ActionApiSyncReceived,
} from '~client/actions';
import { IDENTITY, sortByKey } from '~client/modules/data';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import {
  WithCrud,
  RequestType,
  RawDate,
  Request,
  IdKey,
  Category,
  Subcategory,
  Entry,
  CreditLimit,
  ValueObject,
  SyncResponseNetWorth as SyncResponse,
  SyncRequestNetWorth as SyncRequest,
  Item,
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
  categories: [],
  subcategories: [],
  entries: [],
  old: [],
  oldOptions: [],
};

const removeDeletedSubcategories = (state: State): State => ({
  ...state,
  subcategories: state.subcategories.filter(({ categoryId }: Subcategory) =>
    state.categories.some(({ id }: Category) => id === categoryId),
  ),
});

const removeDeletedEntries = (state: State): State => ({
  ...state,
  entries: state.entries.map<Entry>(({ values, creditLimit, ...rest }) => ({
    ...rest,
    values: values.filter(({ subcategory }) =>
      state.subcategories.some(({ id }: Subcategory) => id === subcategory),
    ),
    creditLimit: creditLimit.filter(({ subcategory }: CreditLimit) =>
      state.subcategories.some(({ id }: Subcategory) => id === subcategory),
    ),
  })),
});

const removeDependencies = (state: State): State =>
  compose(removeDeletedEntries, removeDeletedSubcategories)(state);

const onRead = (
  state: State,
  {
    res: {
      netWorth: { categories, subcategories, entries },
    },
  }: ActionApiDataRead,
): State => ({
  ...state,
  categories: categories.data,
  subcategories: subcategories.data,
  entries: entries.data.items.map<Entry>(
    ({ date, values = [], creditLimit = [], currencies = [], ...rest }) => ({
      date: new Date(date),
      values: sortByKey<'id', ValueObject>('id')(values),
      creditLimit,
      currencies,
      ...rest,
    }),
  ),
  old: entries.data.old ?? [],
  oldOptions: entries.data.oldOptions ?? [],
});

const withoutUnnecessaryChange = <T>(items: T[], updatedItems: T[]): T[] =>
  updatedItems.length === items.length && updatedItems.every((item, index) => item === items[index])
    ? items
    : updatedItems;

const entryIsRaw = (entry: Entry | RawDate<Entry>): entry is RawDate<Entry> =>
  typeof entry.date === 'string';

const sortEntryValues = (entries: Entry[]): Entry[] =>
  entries.map((entry) => ({
    ...entry,
    values: sortByKey<'subcategory', ValueObject>('subcategory')(entry.values),
  }));

const withDates = (entries: (Entry | RawDate<Entry>)[]): Entry[] =>
  entries.map(
    (entry): Entry =>
      entryIsRaw(entry)
        ? {
            ...entry,
            date: new Date(entry.date),
          }
        : entry,
  );

const withChanges = (requestType: RequestType.create | RequestType.update, reqIdKey: IdKey) => <
  T extends { [id in K]: string },
  K extends string = 'id'
>({
  getId = (item): string => Reflect.get(item, 'id'),
  mapResponse = IDENTITY,
  getItem = (item, res): T => ({
    ...item,
    ...res,
    __optimistic: undefined,
  }),
}: Partial<{
  getId: (item: T) => string;
  mapResponse: (item: SyncResponse) => Partial<Item>;
  getItem: (item: T, res: Partial<Item>) => T;
}> = {}) => (requests: SyncRequest[]) => (items: T[]): T[] =>
  withoutUnnecessaryChange(
    items,
    items.map((item) => {
      const changed = requests.find(
        ({ type, [reqIdKey]: reqId }: Request) => type === requestType && reqId === getId(item),
      );
      if (changed) {
        return getItem(item, mapResponse(changed.res));
      }

      return item;
    }),
  );

const withCreates = withChanges(RequestType.create, 'fakeId');

const updateSubcategoriesOnCategoryCreate = withCreates<Subcategory>({
  getId: (subcategory): string => subcategory.categoryId,
  getItem: (item, res) => ({ ...item, categoryId: res.id as string }),
});

const updateEntriesOnSubcategoryCreate = (requests: SyncRequest[]) => (
  entries: WithCrud<Entry>[],
): WithCrud<Entry>[] =>
  withoutUnnecessaryChange(
    entries,
    entries.map<Entry>((entry) => ({
      ...entry,
      values: withCreates<ValueObject, 'subcategory'>({
        getId: ({ subcategory }) => subcategory,
        getItem: (value, { id = '' }) => ({ ...value, subcategory: id }),
      })(requests)(entry.values),

      creditLimit: withCreates<CreditLimit, 'subcategory'>({
        getId: ({ subcategory }) => subcategory,
        getItem: (creditLimit, { id = '' }) => ({
          ...creditLimit,
          subcategory: id,
        }),
      })(requests)(entry.creditLimit),
    })),
  );

const confirmCreates = (requests: SyncRequest[]) => (state: State): State => ({
  ...state,
  categories: withCreates<Category>()(requests)(state.categories),
  subcategories: compose(
    updateSubcategoriesOnCategoryCreate(requests),
    withCreates<Subcategory>()(requests),
  )(state.subcategories),
  entries: compose(
    sortEntryValues,
    withDates,
    updateEntriesOnSubcategoryCreate(requests),
    withCreates<Entry>()(requests),
  )(state.entries),
});

const withUpdates = <T extends Item>(requests: SyncRequest[], items: T[]): T[] =>
  withChanges(RequestType.update, 'id')<T>()(requests)(items);

const confirmUpdates = (requests: SyncRequest[]) => (state: State): State => ({
  ...state,
  categories: withUpdates<Category>(requests, state.categories),
  subcategories: withUpdates<Subcategory>(requests, state.subcategories),
  entries: withUpdates<Entry>(requests, state.entries),
});

const withDeletes = <T extends Item>(requests: SyncRequest[]) => (items: T[]): T[] =>
  withoutUnnecessaryChange(
    items,
    items.filter(
      (item) =>
        !requests.some(({ type, id }: Request) => type === RequestType.delete && id === item.id),
    ),
  );

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
      return { ...state, categories: onCreateOptimistic(state.categories, action.item) };
    case ActionTypeNetWorth.CategoryUpdated:
      return { ...state, categories: onUpdateOptimistic(state.categories, action.id, action.item) };
    case ActionTypeNetWorth.CategoryDeleted:
      return removeDependencies({
        ...state,
        categories: onDeleteOptimistic(state.categories, action.id),
      });

    case ActionTypeNetWorth.SubcategoryCreated:
      return { ...state, subcategories: onCreateOptimistic(state.subcategories, action.item) };
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
      return { ...state, entries: onCreateOptimistic(state.entries, action.item) };
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
      return onSyncReceived(state, action);

    case ActionTypeLogin.LoggedOut:
      return initialState;
    default:
      return state;
  }
}
