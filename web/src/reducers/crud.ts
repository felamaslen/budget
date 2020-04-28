import shortid from 'shortid';
import { replaceAtIndex, removeAtIndex } from 'replace-array';

import { WithCrud, Create, RequestType } from '~client/types/crud';

export type State<I extends object> = WithCrud<Create<I> & { id: string }>[];

export const onCreateOptimistic = <I extends object>(
  state: State<I>,
  newItem: Create<I>,
): State<I> => [
  ...state,
  {
    ...newItem,
    id: shortid.generate(),
    __optimistic: RequestType.create,
  },
];

export const onUpdateOptimistic = <I extends object>(
  state: State<I>,
  id: string,
  updatedItem: Partial<Create<I>>,
): State<I> => {
  const index = state.findIndex(({ id: idMatch }) => idMatch === id);
  const isDeleting = index > -1 && state[index].__optimistic === RequestType.delete;
  const notChanged =
    index === -1 ||
    (Object.keys(updatedItem) as (keyof Partial<Create<I>>)[]).every(
      key => updatedItem[key] === state[index][key],
    );

  if (isDeleting || notChanged) {
    return state;
  }

  return replaceAtIndex(state, index, oldItem => ({
    ...oldItem,
    ...updatedItem,
    __optimistic:
      oldItem.__optimistic === RequestType.create ? RequestType.create : RequestType.update,
  }));
};

export const onDeleteOptimistic = <I extends object>(state: State<I>, id: string): State<I> => {
  const index = state.findIndex(({ id: idMatch }) => idMatch === id);
  const isCreating = index > -1 && state[index].__optimistic === RequestType.create;

  if (isCreating) {
    return removeAtIndex(state, index);
  }

  return replaceAtIndex(state, index, oldItem => ({
    ...oldItem,
    __optimistic: RequestType.delete,
  }));
};
