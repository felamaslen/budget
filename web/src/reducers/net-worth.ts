import { createReducerObject, Action } from 'create-reducer-object';
import { compose } from '@typed/compose';
import { DateTime } from 'luxon';

import {
  Category,
  Subcategory,
  Entry,
  CreditLimit,
  ValueObject,
  Currency,
  RequestItem,
  NetWorthRequestGeneric,
} from '~client/types/net-worth';
import { WithCrud, RequestType, RawDate } from '~client/types/crud';

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

import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import { Request } from '~client/reducers/list';

import { IDENTITY } from '~client/modules/data';

type ExtraState = {
  old: number[];
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
};

const removeDeletedSubcategories = (state: State): State => ({
  ...state,
  subcategories: state.subcategories.filter(({ categoryId }: Subcategory) =>
    state.categories.some(({ id }: Category) => id === categoryId),
  ),
});

const removeDeletedEntries = (state: State): State => ({
  ...state,
  entries: state.entries.map(({ values, creditLimit, ...rest }: Entry) => ({
    ...rest,
    values: values.filter(({ subcategory }: ValueObject) =>
      state.subcategories.some(({ id }: Subcategory) => id === subcategory),
    ),
    creditLimit: creditLimit.filter(({ subcategory }: CreditLimit) =>
      state.subcategories.some(({ id }: Subcategory) => id === subcategory),
    ),
  })),
});

const removeDependencies = (state: State): State =>
  compose(removeDeletedEntries, removeDeletedSubcategories)(state);

const onCreateCategory = (state: State, action: Action): Partial<State> => ({
  categories: onCreateOptimistic<Category>(state.categories, action.item),
});

const onUpdateCategory = (state: State, action: Action): Partial<State> => ({
  categories: onUpdateOptimistic<Category>(state.categories, action.id, action.item),
});

const onDeleteCategory = (state: State, action: Action): Partial<State> =>
  removeDependencies({
    ...state,
    categories: onDeleteOptimistic<Category>(state.categories, action.id),
  });

const onCreateSubcategory = (state: State, action: Action): Partial<State> => ({
  subcategories: onCreateOptimistic<Subcategory>(state.subcategories, action.item),
});

const onUpdateSubcategory = (state: State, action: Action): Partial<State> => ({
  subcategories: onUpdateOptimistic<Subcategory>(state.subcategories, action.id, action.item),
});

const onDeleteSubcategory = (state: State, action: Action): Partial<State> =>
  removeDependencies({
    ...state,
    subcategories: onDeleteOptimistic<Subcategory>(state.subcategories, action.id),
  });

const onCreateEntry = (state: State, action: Action): Partial<State> => ({
  entries: onCreateOptimistic<Entry>(state.entries, action.item),
});

const onUpdateEntry = (state: State, action: Action): Partial<State> => ({
  entries: onUpdateOptimistic<Entry>(state.entries, action.id, action.item),
});

const onDeleteEntry = (state: State, action: Action): Partial<State> => ({
  ...state,
  entries: onDeleteOptimistic<Entry>(state.entries, action.id),
});

const onRead = (
  state: State,
  {
    res: {
      netWorth: { categories, subcategories, entries },
    },
  }: Action,
): State => ({
  ...state,
  categories: categories.data,
  subcategories: subcategories.data,
  entries: entries.data.items.map(
    ({
      date,
      values = [],
      creditLimit = [],
      currencies = [],
      ...rest
    }: {
      date: string;
      values: ValueObject[];
      creditLimit: CreditLimit[];
      currencies: Currency[];
    }) => ({
      date: DateTime.fromISO(date),
      values,
      creditLimit,
      currencies,
      ...rest,
    }),
  ),
  old: entries.data.old || [],
});

type Response = { id: string };

const withoutUnnecessaryChange = <T>(items: T[], updatedItems: T[]): T[] =>
  updatedItems.length === items.length && updatedItems.every((item, index) => item === items[index])
    ? items
    : updatedItems;

const entryIsRaw = (entry: Entry | RawDate<Entry>): entry is RawDate<Entry> =>
  typeof entry.date === 'string';

const withDates = (entries: (Entry | RawDate<Entry>)[]): Entry[] =>
  withoutUnnecessaryChange(
    entries as Entry[],
    entries.map(entry =>
      entryIsRaw(entry)
        ? {
            ...entry,
            date: DateTime.fromISO(entry.date),
          }
        : entry,
    ),
  );

const withChanges = (
  requestType: RequestType.create | RequestType.update,
  reqIdKey: 'id' | 'fakeId',
) => <T extends { [id in K]: string }, K extends string = 'id'>({
  getId = (item): string => Reflect.get(item, 'id'),
  mapResponse = IDENTITY,
  getItem = (item, res): T => ({
    ...item,
    ...res,
    __optimistic: undefined,
  }),
}: Partial<{
  getId: (item: T) => string;
  mapResponse: (item: RequestItem) => Partial<Response>;
  getItem: (item: T, res: Partial<Response>) => T;
}> = {}) => (requests: NetWorthRequestGeneric[]) => (items: T[]): T[] =>
  withoutUnnecessaryChange(
    items,
    items.map(item => {
      const changed = requests.find(
        ({ type, [reqIdKey]: reqId }: Request): boolean =>
          type === requestType && reqId === getId(item),
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

const updateEntriesOnSubcategoryCreate = (requests: NetWorthRequestGeneric[]) => (
  entries: WithCrud<Entry>[],
): WithCrud<Entry>[] =>
  withoutUnnecessaryChange(
    entries,
    entries.map(entry => ({
      ...entry,
      values: withCreates<ValueObject>({
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

const confirmCreates = (requests: NetWorthRequestGeneric[]) => (state: State): State => ({
  ...state,
  categories: withCreates<Category>()(requests)(state.categories),
  subcategories: compose(
    updateSubcategoriesOnCategoryCreate(requests),
    withCreates<Subcategory>()(requests),
  )(state.subcategories),
  entries: compose(
    withDates,
    updateEntriesOnSubcategoryCreate(requests),
    withCreates<Entry>()(requests),
  )(state.entries),
});

const withUpdates = <T extends { id: string }>(
  requests: NetWorthRequestGeneric[],
  items: T[],
): T[] => withChanges(RequestType.update, 'id')<T>()(requests)(items);

const confirmUpdates = (requests: NetWorthRequestGeneric[]) => (state: State): State => ({
  ...state,
  categories: withUpdates<Category>(requests, state.categories),
  subcategories: withUpdates<Subcategory>(requests, state.subcategories),
  entries: withUpdates<Entry>(requests, state.entries),
});

const withDeletes = <T extends { id: string }>(requests: NetWorthRequestGeneric[]) => (
  items: T[],
): T[] =>
  withoutUnnecessaryChange(
    items,
    items.filter(
      item =>
        !requests.some(({ type, id }: Request) => type === RequestType.delete && id === item.id),
    ),
  );

const confirmDeletes = (requests: NetWorthRequestGeneric[]) => (state: State): State =>
  removeDependencies({
    ...state,
    categories: withDeletes<Category>(requests)(state.categories),
    subcategories: withDeletes<Subcategory>(requests)(state.subcategories),
    entries: withDeletes<Entry>(requests)(state.entries),
  });

const onSyncReceived = (
  state: State,
  { res: { netWorth: requests = [] } }: Action,
): Partial<State> => {
  return compose(
    confirmCreates(requests),
    confirmUpdates(requests),
    confirmDeletes(requests),
  )(state);
};

const handlers = {
  [LOGGED_OUT]: (): State => initialState,
  [NET_WORTH_CATEGORY_CREATED]: onCreateCategory,
  [NET_WORTH_CATEGORY_UPDATED]: onUpdateCategory,
  [NET_WORTH_CATEGORY_DELETED]: onDeleteCategory,
  [NET_WORTH_SUBCATEGORY_CREATED]: onCreateSubcategory,
  [NET_WORTH_SUBCATEGORY_UPDATED]: onUpdateSubcategory,
  [NET_WORTH_SUBCATEGORY_DELETED]: onDeleteSubcategory,
  [NET_WORTH_CREATED]: onCreateEntry,
  [NET_WORTH_UPDATED]: onUpdateEntry,
  [NET_WORTH_DELETED]: onDeleteEntry,
  [DATA_READ]: onRead,
  [SYNC_RECEIVED]: onSyncReceived,
};

export default createReducerObject<State>(handlers, initialState);
