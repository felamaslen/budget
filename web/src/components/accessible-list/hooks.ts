import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { getItems } from './selectors';
import { SortItemsPre, SortItemsPost, CustomSelector } from './types';
import { OnUpdateList, OnDeleteList } from '~client/actions';
import { Item, Create } from '~client/types';

const identitySelector = <E extends {}>(): { [id: string]: Partial<E> } => ({});

export type ItemExtraPropsMap<E extends {}> = { [id: string]: Partial<E> };

export function useSortedItems<I extends Item, P extends string, E extends {}>(
  page: P,
  sortItemsPre?: SortItemsPre<I>,
  sortItemsPost?: SortItemsPost<I, E>,
  customSelector: CustomSelector<I, E> = identitySelector,
): {
  itemsSorted: I[];
  extraProps: ItemExtraPropsMap<E>;
} {
  const itemsSortedPre: I[] = useSelector(getItems<I, P>(page, sortItemsPre));

  const extraProps = useMemo<ItemExtraPropsMap<E>>(() => customSelector(itemsSortedPre), [
    itemsSortedPre,
    customSelector,
  ]);

  const itemsSorted: I[] = useMemo<I[]>(
    () => (sortItemsPost ? sortItemsPost(itemsSortedPre, extraProps) : itemsSortedPre),
    [itemsSortedPre, extraProps, sortItemsPost],
  );

  return { itemsSorted, extraProps };
}

export function useMobileEditModal<I extends Item, P extends string>(
  itemsSorted: I[],
  actionOnUpdate: OnUpdateList<I, P, void>,
  actionOnDelete: OnDeleteList<I, P, void>,
): {
  active: boolean;
  activate: (id: string) => void;
  item: I | undefined;
  onCancel: () => void;
  onSubmit: (delta: Create<I>) => void;
  onDelete: () => void;
} {
  const [editingId, setEditingId] = useState<string | null>(null);
  const item = useMemo<I | undefined>(() => itemsSorted.find(({ id }) => id === editingId), [
    editingId,
    itemsSorted,
  ]);
  const active = !!editingId;

  const onCancel = useCallback(() => setEditingId(null), []);

  const activate = useCallback((id: string) => setEditingId(id), []);

  const onSubmit = useCallback(
    (delta: Create<I>): void => {
      if (!item) {
        return;
      }
      setEditingId(null);
      actionOnUpdate(item.id, delta, item);
    },
    [item, actionOnUpdate],
  );

  const onDelete = useCallback((): void => {
    if (!item) {
      return;
    }
    setEditingId(null);
    actionOnDelete(item.id, item);
  }, [item, actionOnDelete]);

  return { active, activate, onCancel, onSubmit, onDelete, item };
}
