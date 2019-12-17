import { Reducer } from 'redux';

import { SocketAction, ErrorAction, isErrorAction } from '~/types/actions';
import { OptimisticStatus, OptimisticItem, CrudOptions, isPayloadDefined } from '~/types/crud';
import { CREATE, UPDATE, DELETE } from '~/constants/crud';
import { ERRORED } from '~/constants/actions.rt';
import { LOGGED_OUT } from '~/constants/actions.app';
import { removeAtIndex, replaceAtIndex } from '~/modules/array';

export const fieldExists = (...args: any[]): boolean =>
  typeof args[0] !== 'undefined' &&
  args[0] !== null &&
  !(typeof args[0] === 'string' && !args[0].length);

type RequestType = string;

export type CrudState<T> = {
  items: OptimisticItem<T>[];
  total?: number;
};

function isCrudAction<T>(
  action: SocketAction<OptimisticItem<T>> | ErrorAction,
): action is SocketAction<OptimisticItem<T>> {
  return action.type !== ERRORED;
}

function getNextOptimisticStatus(
  lastStatus: OptimisticStatus,
  requestType: RequestType,
): RequestType {
  if (requestType === DELETE) {
    return DELETE;
  }

  return lastStatus || requestType;
}

function getOptimisticUpdateItems<T>(
  requestType: RequestType,
  state: CrudState<T>,
  action: SocketAction<T>,
  index: number,
): T[] {
  if (requestType === DELETE && state.items[index].__optimistic === CREATE) {
    return removeAtIndex(state.items, index);
  }

  const newItem: T = {
    ...state.items[index],
    ...(action.payload || {}),
  };

  if (
    requestType === UPDATE &&
    (Object.keys(newItem) as (keyof T)[]).every(
      column => newItem[column] === state.items[index][column],
    )
  ) {
    return state.items;
  }

  return replaceAtIndex<T>(state.items, index, {
    ...newItem,
    __optimistic: getNextOptimisticStatus(state.items[index].__optimistic, requestType),
  });
}

function getTotals<T extends { id?: string; cost?: number }>(
  requestType: string,
  state: CrudState<T>,
  nextItems: OptimisticItem<T>[],
  index: number,
): number {
  const withoutOld = Number(state.total) - Number(state.items[index].cost);
  if (requestType === DELETE) {
    return withoutOld;
  }

  return withoutOld + Number(nextItems[index].cost);
}

function withOptimisticUpdate<T extends { id?: string }>(
  requestType: RequestType,
  withTotals: boolean,
  state: CrudState<T>,
  action: SocketAction<T>,
): Partial<CrudState<T>> {
  const index = state.items.findIndex(({ id }: OptimisticItem<T>) => id === action.payload?.id);
  if (index === -1) {
    return {};
  }

  const items = getOptimisticUpdateItems<T>(requestType, state, action, index);

  if (withTotals) {
    return {
      items,
      total: getTotals(requestType, state, items, index),
    };
  }

  return { items };
}

export function onCreateOptimistic<T extends { id?: string | undefined; cost?: number }>(
  columns: (keyof OptimisticItem<T>)[],
) {
  return (options: CrudOptions) => (
    state: CrudState<T>,
    action: SocketAction<OptimisticItem<T>>,
  ): Partial<CrudState<T>> => {
    if (
      !isPayloadDefined(action.payload) ||
      columns.some(column => !fieldExists(action.payload && action.payload[column]))
    ) {
      return {};
    }

    const { fakeId, ...item } = action.payload;

    const items = [
      ...state.items,
      {
        ...item,
        id: fakeId,
        __optimistic: CREATE,
      } as OptimisticItem<T>,
    ];

    if (options.withTotals) {
      return {
        items,
        total: Number(state.total) + Number(action.payload.cost),
      };
    }

    return { items };
  };
}

export function onUpdateOptimistic<T extends { id?: string }>() {
  return (options: CrudOptions) => (
    state: CrudState<T>,
    action: SocketAction<OptimisticItem<T>>,
  ): Partial<CrudState<T>> => {
    return withOptimisticUpdate<T>(UPDATE, options.withTotals, state, action);
  };
}

export function onDeleteOptimistic<T extends { id?: string }>() {
  return (options: CrudOptions) => (
    state: CrudState<T>,
    action: SocketAction<T>,
  ): Partial<CrudState<T>> => {
    return withOptimisticUpdate<T>(DELETE, options.withTotals, state, action);
  };
}

export function withoutDeleted<T extends { __optimistic?: OptimisticStatus }>(items: T[]): T[] {
  return items.filter(({ __optimistic }) => __optimistic !== DELETE);
}

const initialStateBare = { items: [] };
const initialStateWithTotals = { ...initialStateBare, total: 0 };

function makeInitialState<T>({ withTotals }: CrudOptions): CrudState<T> {
  if (withTotals) {
    return initialStateWithTotals;
  }

  return initialStateBare;
}

export function crudReducer<T extends { id?: string }>(
  {
    handlers,
    withTotals = false,
  }: {
    handlers: {
      [actionType: string]: {
        onSend?: (
          options: CrudOptions,
        ) => (state: CrudState<T>, action: SocketAction<T>) => Partial<CrudState<T>>;
        onReceive?: (
          options: CrudOptions,
        ) => (
          state: CrudState<T>,
          action: SocketAction<OptimisticItem<T>>,
        ) => Partial<CrudState<T>>;
        onError?: (
          options: CrudOptions,
        ) => (state: CrudState<T>, action: ErrorAction) => Partial<CrudState<T>>;
      };
    };
    withTotals?: boolean;
  } = {
    handlers: {},
  },
): {
  reducer: Reducer<CrudState<T>, SocketAction<OptimisticItem<T>> | ErrorAction>;
  initialState: CrudState<T>;
} {
  const options: CrudOptions = {
    withTotals,
  };

  const initialState = makeInitialState<T>(options);

  const reducer = (
    state: CrudState<T> = initialState,
    action: SocketAction<T> | ErrorAction,
  ): CrudState<T> => {
    if (isErrorAction(action) && action.actionType in handlers) {
      const { onError } = handlers[action.actionType];

      if (onError) {
        return { ...state, ...onError(options)(state, action) };
      }

      return state;
    }
    if (action.type === LOGGED_OUT) {
      return initialState;
    }
    if (!(isCrudAction(action) && action.type in handlers)) {
      return state;
    }

    const { onSend, onReceive } = handlers[action.type];

    if (!action.__FROM_SOCKET__ && onSend) {
      return { ...state, ...onSend(options)(state, action) };
    }
    if (action.__FROM_SOCKET__ && onReceive) {
      return { ...state, ...onReceive(options)(state, action) };
    }

    return state;
  };

  return { reducer, initialState };
}
