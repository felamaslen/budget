import { Action } from 'redux';

import { RequestType } from '~client/types/crud';
import { removeAtIndex, replaceAtIndex, fieldExists } from '~client/modules/data';

function getNextRequestType(lastStatus: RequestType, requestType: RequestType): RequestType {
  if (requestType === RequestType.delete) {
    return RequestType.delete;
  }

  return lastStatus || requestType;
}

type Item = {
  id: string;
  cost: number;
  __optimistic: RequestType;
};

type State<I extends Item, K extends string = 'items'> = {
  total: number;
  crud: Record<K, I[]>;
};

type IAction<I extends Item> = Action & {
  id?: string;
  item?: I;
};

type GetNewProps<I extends Item> = (action: IAction<I>, item: I) => Partial<I>;

const getOptimisticUpdateItems = <I extends Item, K extends string, S extends State<I, K>>(
  key: K,
  requestType: RequestType,
  getNewProps: GetNewProps<I>,
) => (state: S, action: IAction<I>, index: number): I[] => {
  if (
    requestType === RequestType.delete &&
    state.crud[key][index].__optimistic === RequestType.create
  ) {
    return removeAtIndex(state.crud[key], index);
  }

  const newItem: I = { ...state.crud[key][index], ...getNewProps(action, state.crud[key][index]) };

  if (
    requestType === RequestType.update &&
    (Object.keys(newItem) as (keyof I)[]).every(
      column => newItem[column] === state.crud[key][index][column],
    )
  ) {
    return state.crud[key];
  }

  return replaceAtIndex(state.crud[key], index, {
    ...newItem,
    __optimistic: getNextRequestType(state.crud[key][index].__optimistic, requestType),
  });
};

const getNewTotals = <I extends Item, K extends string>(key: K, requestType: RequestType) => (
  state: State<I, K>,
  nextItems: I[],
  index: number,
): number => {
  const withoutOld = state.total - state.crud[key][index].cost;
  if (requestType === RequestType.delete) {
    return withoutOld;
  }

  return withoutOld + nextItems[index].cost;
};

const withOptimisticUpdate = <I extends Item, K extends string>(
  key: K,
  requestType: RequestType,
  withTotals: boolean,
  getNewProps: GetNewProps<I> = (): Partial<I> => ({}),
): ((state: State<I, K>, action: IAction<I>) => Partial<State<I, K>>) => {
  const getItems = getOptimisticUpdateItems(key, requestType, getNewProps);
  const getTotals = getNewTotals(key, requestType);

  return (state, action): Partial<State<I, K>> => {
    const index = state.crud[key].findIndex(({ id }) => id === action.id);
    if (index === -1) {
      return {};
    }

    const items: I[] = getItems(state, action, index);

    if (withTotals) {
      return {
        crud: {
          ...state.crud,
          [key]: items,
        },
        total: getTotals(state, items, index),
      };
    }

    return { [key]: items };
  };
};

export const onCreateOptimistic = <I extends Item, K extends string>(
  key: K,
  columns: (keyof I)[],
  withTotals = false,
) => (state: State<I, K>, { item, fakeId }: { item: I; fakeId: string }): Partial<State<I, K>> => {
  if (columns.some(column => !fieldExists(item[column]))) {
    return {};
  }

  const itemFiltered = (Object.keys(item) as (keyof I)[])
    .filter(column => columns.includes(column))
    .reduce((last, column) => ({ ...last, [column]: item[column] }), {});

  const items: I[] = [
    ...state.crud[key],
    { ...itemFiltered, id: fakeId, __optimistic: RequestType.create } as I,
  ];

  if (withTotals) {
    return { [key]: items, total: state.total + item.cost };
  }

  return { [key]: items };
};

export const onUpdateOptimistic = <I extends Item, K extends string>(
  key: K,
  withTotals = false,
): ((state: State<I, K>, action: IAction<I>) => Partial<State<I, K>>) =>
  withOptimisticUpdate<I, K>(
    key,
    RequestType.update,
    withTotals,
    ({ item }: IAction<I>, oldItem: I): Partial<I> => {
      const oldColumns = Object.keys(oldItem) as (keyof I)[];
      const newColumns = (Object.keys(item || {}) as (keyof I)[]).filter(column =>
        oldColumns.includes(column),
      );

      return newColumns.reduce((last, column) => ({ ...last, [column]: item?.[column] }), {});
    },
  );

export const onDeleteOptimistic = <I extends Item, K extends string>(
  key: K,
  withTotals = false,
): ((state: State<I, K>, action: IAction<I>) => Partial<State<I, K>>) =>
  withOptimisticUpdate(key, RequestType.delete, withTotals);
