import { replaceAtIndex, removeAtIndex } from 'replace-array';

import { Id, Item, RequestType } from '~client/types';

export type State<I extends Item> = {
  items: I[];
  __optimistic: (RequestType | undefined)[];
};

export function onCreateOptimistic<I extends Record<string, unknown>, R extends Item = Item>(
  state: State<R>,
  id: Id,
  newItem: I,
  originalFakeId?: Id,
): State<R> {
  if (!originalFakeId) {
    return {
      items: [...state.items, { ...newItem, id } as R],
      __optimistic: [...state.__optimistic, RequestType.create],
    };
  }

  const confirmCreateIndex = state.items.findIndex(
    (item, index) => item.id === originalFakeId && state.__optimistic[index] === RequestType.create,
  );

  if (confirmCreateIndex === -1) {
    return {
      items: [...state.items, { ...newItem, id } as R],
      __optimistic: [...state.__optimistic, undefined],
    };
  }

  return {
    items: replaceAtIndex(state.items, confirmCreateIndex, (last) => ({
      ...last,
      id,
    })),
    __optimistic: replaceAtIndex(state.__optimistic, confirmCreateIndex, undefined),
  };
}

export function onUpdateOptimistic<I extends Record<string, unknown>, R extends Item = Item>(
  state: State<R>,
  id: Id,
  updatedItem: Partial<I>,
  fromServer = false,
): State<R> {
  const index = state.items.findIndex(({ id: idMatch }) => idMatch === id);
  if (fromServer) {
    return {
      items: replaceAtIndex(state.items, index, (oldItem) => ({ ...oldItem, ...updatedItem })),
      __optimistic: replaceAtIndex(state.__optimistic, index, undefined),
    };
  }

  const isDeleting = index > -1 && state.__optimistic[index] === RequestType.delete;
  const notChanged =
    index === -1 ||
    (Object.keys(updatedItem) as (keyof I)[]).every(
      (key) => updatedItem[key] === state.items[index][key as keyof R],
    );

  if (isDeleting || notChanged) {
    return state;
  }

  return {
    items: replaceAtIndex(state.items, index, (oldItem) => ({ ...oldItem, ...updatedItem })),
    __optimistic: replaceAtIndex(state.__optimistic, index, (last) =>
      last === RequestType.create ? RequestType.create : RequestType.update,
    ),
  };
}

export function onDeleteOptimistic<R extends Item>(
  state: State<R>,
  id: Id,
  fromServer = false,
): State<R> {
  const index = state.items.findIndex(({ id: idMatch }) => idMatch === id);
  const isCreating = index > -1 && state.__optimistic[index] === RequestType.create;

  if (fromServer || isCreating) {
    return {
      items: removeAtIndex(state.items, index),
      __optimistic: removeAtIndex(state.__optimistic, index),
    };
  }

  return {
    items: state.items,
    __optimistic: replaceAtIndex(state.__optimistic, index, RequestType.delete),
  };
}
