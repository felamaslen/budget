/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';

import {
  OnCreateList,
  OnUpdateList,
  OnDeleteList,
  ListItemCreated,
  ListItemUpdated,
  ListItemDeleted,
} from '~client/actions/list';
import { PageList, Item, Create, CreateEdit, DeltaEdit } from '~client/types';

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

const useCrudFactory = <
  ArgsC extends any[],
  ArgsU extends any[],
  ArgsD extends any[],
  ActionCreate extends Action = Action,
  ActionUpdate extends Action = Action,
  ActionDelete extends Action = Action
>(
  actionOnCreate: Trigger<ArgsC, ActionCreate>,
  actionOnUpdate: Trigger<ArgsU, ActionUpdate>,
  actionOnDelete: Trigger<ArgsD, ActionDelete>,
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

export const useCrud = <
  I extends Item,
  ActionCreate extends Action = Action,
  ActionUpdate extends Action = Action,
  ActionDelete extends Action = Action
>(
  onCreate: OnCreate<I, ActionCreate>,
  onUpdate: OnUpdate<I, ActionUpdate>,
  onDelete: OnDelete<I, ActionDelete>,
): [OnCreate<I>, OnUpdate<I>, OnDelete<I>] =>
  useCrudFactory<
    [Create<I>],
    [string, Create<I>],
    [string, I | undefined],
    ActionCreate,
    ActionUpdate,
    ActionDelete
  >(onCreate, onUpdate, onDelete);

export const useListCrud = <I extends Item, P extends string = PageList>(
  onCreate: OnCreateList<I, P>,
  onUpdate: OnUpdateList<I, P>,
  onDelete: OnDeleteList<I, P>,
): [OnCreateList<I, P, void>, OnUpdateList<I, P, void>, OnDeleteList<I, P, void>] =>
  useCrudFactory<
    [Create<I>],
    [string, DeltaEdit<I>, CreateEdit<I>],
    [string, CreateEdit<I>],
    ListItemCreated<I, P>,
    ListItemUpdated<I, P>,
    ListItemDeleted<I, P>
  >(onCreate, onUpdate, onDelete);
