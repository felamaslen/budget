import { Action } from 'redux';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { Create } from '~client/types/crud';

export type OnCreate<I> = (item: Create<I>) => void;
export type OnUpdate<I> = (id: string, item: Create<I>) => void;
export type OnDelete = (id: string) => void;

export type SetActiveId = (id: string | null) => void;

export const useCrud = <I>(
  actionOnCreate: (item: Create<I>) => Action,
  actionOnUpdate: (id: string, item: Create<I>) => Action,
  actionOnDelete: (id: string) => Action,
): [OnCreate<I>, OnUpdate<I>, OnDelete] => {
  const dispatch = useDispatch();
  const onCreate = useCallback(
    (item: Create<I>): void => {
      dispatch(actionOnCreate(item));
    },
    [dispatch, actionOnCreate],
  );
  const onUpdate = useCallback(
    (id: string, item: Create<I>): void => {
      dispatch(actionOnUpdate(id, item));
    },
    [dispatch, actionOnUpdate],
  );
  const onDelete = useCallback(
    (id: string): void => {
      dispatch(actionOnDelete(id));
    },
    [dispatch, actionOnDelete],
  );

  return [onCreate, onUpdate, onDelete];
};
