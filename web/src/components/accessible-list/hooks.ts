import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { getItems } from './selectors';
import { SortItemsPre, SortItemsPost, CustomSelector } from './types';
import { OnUpdateList, OnDeleteList } from '~client/actions';
import { Item, Create } from '~client/types';

const identitySelector = <E extends {}>(): { [id: string]: Partial<E> } => ({});

type ItemExtraPropsMap<E extends {}> = { [id: string]: Partial<E> };

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
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const item = itemsSorted[editingIndex];
  const active = editingIndex !== -1;

  const onCancel = useCallback(() => setEditingIndex(-1), []);
  const activate = useCallback(
    (id: string) => setEditingIndex(itemsSorted.findIndex((compare) => compare.id === id)),
    [itemsSorted],
  );

  const onSubmit = useCallback(
    (delta: Create<I>): void => {
      if (!item) {
        return;
      }
      setEditingIndex(-1);
      actionOnUpdate(item.id, delta, item);
    },
    [item, actionOnUpdate],
  );

  const onDelete = useCallback((): void => {
    if (!item) {
      return;
    }
    setEditingIndex(-1);
    actionOnDelete(item.id, item);
  }, [item, actionOnDelete]);

  return { active, activate, onCancel, onSubmit, onDelete, item };
}
