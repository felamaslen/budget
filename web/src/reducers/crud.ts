import { replaceAtIndex, removeAtIndex } from 'replace-array';

import {
  Id,
  Create,
  Delta,
  RequestType,
  Item,
  Request,
  IdKey,
  RequestWithResponse,
} from '~client/types';

export type State<I extends Item> = {
  items: I[];
  __optimistic: (RequestType | undefined)[];
};

export const onCreateOptimistic = <I extends Item>(
  state: State<I>,
  fakeId: number,
  newItem: Create<I>,
): State<I> => ({
  items: [
    ...state.items,
    {
      ...newItem,
      id: fakeId,
    } as I,
  ],
  __optimistic: [...state.__optimistic, RequestType.create],
});

export const onUpdateOptimistic = <I extends Item>(
  state: State<I>,
  id: Id,
  updatedItem: Delta<I>,
): State<I> => {
  const index = state.items.findIndex(({ id: idMatch }) => idMatch === id);
  const isDeleting = index > -1 && state.__optimistic[index] === RequestType.delete;
  const notChanged =
    index === -1 ||
    (Object.keys(updatedItem) as (keyof Delta<I>)[]).every(
      (key) => updatedItem[key] === state.items[index][key],
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
};

export const onDeleteOptimistic = <I extends Item>(state: State<I>, id: Id): State<I> => {
  const index = state.items.findIndex(({ id: idMatch }) => idMatch === id);
  const isCreating = index > -1 && state.__optimistic[index] === RequestType.create;

  if (isCreating) {
    return {
      items: removeAtIndex(state.items, index),
      __optimistic: removeAtIndex(state.__optimistic, index),
    };
  }

  return {
    items: state.items,
    __optimistic: replaceAtIndex(state.__optimistic, index, RequestType.delete),
  };
};

export const confirmOptimisticUpdates = <
  I extends Item,
  S extends State<I> = State<I>,
  R extends Request = Request
>(
  requests: R[],
  state: S,
  idKey: IdKey = 'id',
): typeof state['__optimistic'] =>
  requests.reduce<typeof state['__optimistic']>(
    (last, res) =>
      replaceAtIndex(
        last,
        state.items.findIndex(({ id }) => id === res[idKey]),
        undefined,
      ),
    state.__optimistic,
  );

export const withCreatedIds = <P extends string, I extends { [key in P]: number }>(
  requests: RequestWithResponse<object | undefined>[],
  parentKey: P = 'id' as P,
  items: I[],
): I[] =>
  items.map((item) => {
    const updatedParent = requests.find(
      ({ type, fakeId }) => type === RequestType.create && fakeId === (item[parentKey] as number),
    ) as RequestWithResponse<Item>;

    return updatedParent ? { ...item, [parentKey]: updatedParent.res.id } : item;
  });

export const withCreates = <
  I extends Item & { [key in P]: number },
  P extends string = 'id',
  R extends RequestWithResponse<object | undefined> = RequestWithResponse<object | undefined>
>(
  requests: R[],
  parentKey: P = 'id' as P,
  resetOptimistic = true,
) => <S extends State<I>>(state: S): S => ({
  ...state,
  __optimistic: resetOptimistic
    ? confirmOptimisticUpdates(requests, state, 'fakeId')
    : state.__optimistic,
  items: withCreatedIds<P, I>(requests, parentKey, state.items),
});

export const withUpdates = <I extends Item, R extends Request = Request>(requests: R[]) => <
  S extends State<I>
>(
  state: S,
): S => ({
  ...state,
  __optimistic: confirmOptimisticUpdates(requests, state),
  items: state.items,
});

export const withDeletes = <I extends Item, R extends Request = Request>(requests: R[]) => <
  S extends State<I>
>(
  state: S,
): S =>
  requests
    .filter(({ type }) => type === RequestType.delete)
    .reduce<S>((last, request) => {
      const index = last.items.findIndex(({ id }) => id === request.id);
      return {
        ...last,
        items: removeAtIndex(last.items, index),
        __optimistic: removeAtIndex(last.__optimistic, index),
      };
    }, state);
