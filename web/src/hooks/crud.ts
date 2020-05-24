/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from 'create-reducer-object';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { OnCreateList, OnUpdateList, OnDeleteList } from '~client/actions/list';
import { PageList } from '~client/types/app';
import { Create, CreateEdit, DeltaEdit } from '~client/types/crud';
import { Item } from '~client/types/list';

type Trigger<Args extends any[], O = void> = (...args: Args) => O;

export type OnCreate<I, O = void> = (item: Create<I>) => O;
export type OnUpdate<I, O = void> = (id: string, item: Create<I>) => O;
export type OnDelete<I = never, O = void> = (id: string, item?: I) => O;

export type CrudProps<I> = {
  onCreate: OnCreate<I>;
  onUpdate: OnUpdate<I>;
  onDelete: OnDelete<I>;
};

export type SetActiveId = (id: string | null) => void;

const useCrudFactory = <ArgsC extends any[], ArgsU extends any[], ArgsD extends any[]>(
  actionOnCreate: Trigger<ArgsC, Action>,
  actionOnUpdate: Trigger<ArgsU, Action>,
  actionOnDelete: Trigger<ArgsD, Action>,
): [Trigger<ArgsC>, Trigger<ArgsU>, Trigger<ArgsD>] => {
  const dispatch = useDispatch();
  const onCreate: Trigger<ArgsC> = useCallback(
    (...args: ArgsC): void => {
      dispatch(actionOnCreate(...args));
    },
    [dispatch, actionOnCreate],
  );
  const onUpdate: Trigger<ArgsU> = useCallback(
    (...args: ArgsU): void => {
      dispatch(actionOnUpdate(...args));
    },
    [dispatch, actionOnUpdate],
  );
  const onDelete: Trigger<ArgsD> = useCallback(
    (...args: ArgsD): void => {
      dispatch(actionOnDelete(...args));
    },
    [dispatch, actionOnDelete],
  );

  return [onCreate, onUpdate, onDelete];
};

export const useCrud = <I>(
  onCreate: OnCreate<I, Action>,
  onUpdate: OnUpdate<I, Action>,
  onDelete: OnDelete<I, Action>,
): [OnCreate<I>, OnUpdate<I>, OnDelete<I>] =>
  useCrudFactory<[Create<I>], [string, Create<I>], [string, I | undefined]>(
    onCreate,
    onUpdate,
    onDelete,
  );

export const useListCrud = <I extends Item, P extends string = PageList>(
  onCreate: OnCreateList<I, P>,
  onUpdate: OnUpdateList<I, P>,
  onDelete: OnDeleteList<I, P>,
): [OnCreateList<I, P, void>, OnUpdateList<I, P, void>, OnDeleteList<I, P, void>] =>
  useCrudFactory<[Create<I>], [string, DeltaEdit<I>, CreateEdit<I>], [string, CreateEdit<I>]>(
    onCreate,
    onUpdate,
    onDelete,
  );
