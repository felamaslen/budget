import { replaceAtIndex, removeAtIndex } from 'replace-array';
import shortid from 'shortid';

import { WithCrud, Create, Delta, RequestType, Item } from '~client/types';

export type State<I extends Item> = WithCrud<I>[];

export const onCreateOptimistic = <I extends Item>(
  state: State<I>,
  newItem: Create<I>,
): State<I> => [
  ...state,
  {
    ...newItem,
    id: shortid.generate(),
    __optimistic: RequestType.create,
  } as WithCrud<I>,
];

export const onUpdateOptimistic = <I extends Item>(
  state: State<I>,
  id: string,
  updatedItem: Delta<I>,
): State<I> => {
  const index = state.findIndex(({ id: idMatch }) => idMatch === id);
  const isDeleting = index > -1 && state[index].__optimistic === RequestType.delete;
  const notChanged =
    index === -1 ||
    (Object.keys(updatedItem) as (keyof Delta<I>)[]).every(
      (key) => updatedItem[key] === state[index][key],
    );

  if (isDeleting || notChanged) {
    return state;
  }

  return replaceAtIndex(state, index, (oldItem) => ({
    ...oldItem,
    ...updatedItem,
    __optimistic:
      oldItem.__optimistic === RequestType.create ? RequestType.create : RequestType.update,
  }));
};

export const onDeleteOptimistic = <I extends Item>(state: State<I>, id: string): State<I> => {
  const index = state.findIndex(({ id: idMatch }) => idMatch === id);
  const isCreating = index > -1 && state[index].__optimistic === RequestType.create;

  if (isCreating) {
    return removeAtIndex(state, index);
  }

  return replaceAtIndex(state, index, (oldItem) => ({
    ...oldItem,
    __optimistic: RequestType.delete,
  }));
};
