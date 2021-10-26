import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getItems } from './selectors';
import type { SortItemsPre, SortItemsPost, CustomSelector } from './types';

import { listDataReceived } from '~client/actions';
import { PAGE_LIST_LIMIT } from '~client/constants/data';
import { OnDeleteList, OnUpdateList } from '~client/hooks';
import * as gql from '~client/hooks/gql';
import { getListOffset } from '~client/selectors';
import type { Id, WithIds } from '~client/types';
import type { ListItem, ListItemInput, PageListStandard } from '~client/types/gql';

const identitySelector = <E extends Record<string, unknown>>(): {
  [id: string]: Partial<E>;
} => ({});

export type ItemExtraPropsMap<E extends Record<string, unknown>> = { [id: string]: Partial<E> };

export function useSortedItems<
  I extends ListItem,
  P extends string,
  E extends Record<string, unknown>,
>(
  page: P,
  sortItemsPre?: SortItemsPre<I>,
  sortItemsPost?: SortItemsPost<I, E>,
  customSelector: CustomSelector<I, E> = identitySelector,
): {
  itemsSorted: I[];
  extraProps: ItemExtraPropsMap<E>;
} {
  const itemsSortedPre: I[] = useSelector(getItems<I, P>(page, sortItemsPre));

  const extraProps = useMemo<ItemExtraPropsMap<E>>(
    () => customSelector(itemsSortedPre),
    [itemsSortedPre, customSelector],
  );

  const itemsSorted: I[] = useMemo<I[]>(
    () => (sortItemsPost ? sortItemsPost(itemsSortedPre, extraProps) : itemsSortedPre),
    [itemsSortedPre, extraProps, sortItemsPost],
  );

  return { itemsSorted, extraProps };
}

export function useMobileEditModal<I extends ListItemInput>(
  itemsSorted: WithIds<I>[],
  actionOnUpdate: OnUpdateList<I>,
  actionOnDelete: OnDeleteList<I>,
): {
  active: boolean;
  activate: (id: Id) => void;
  item: WithIds<I> | undefined;
  onCancel: () => void;
  onSubmit: (id: Id, delta: I) => void;
  onDelete: () => void;
} {
  const [editingId, setEditingId] = useState<Id | null>(null);
  const item = useMemo<WithIds<I> | undefined>(
    () => itemsSorted.find(({ id }) => id === editingId),
    [editingId, itemsSorted],
  );
  const active = !!editingId;

  const onCancel = useCallback(() => setEditingId(null), []);

  const activate = useCallback((id: Id) => setEditingId(id), []);

  const onSubmit = useCallback(
    (id: Id, delta: I): void => {
      if (!item) {
        return;
      }
      setEditingId(null);
      actionOnUpdate(id, delta, item);
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

export function useMoreItems(page: PageListStandard): () => Promise<void> {
  const dispatch = useDispatch();
  const offset = useSelector(getListOffset(page));

  const [{ data, fetching, stale }, fetchMore] = gql.useMoreListDataStandardQuery({
    pause: offset > 0,
    variables: {
      page,
      offset,
      limit: PAGE_LIST_LIMIT,
    },
  });

  useEffect(() => {
    if (data?.readListStandard && !fetching && !stale) {
      dispatch(listDataReceived(page, data.readListStandard));
    }
  }, [page, dispatch, data, fetching, stale]);

  return useCallback(async (): Promise<void> => {
    fetchMore();
  }, [fetchMore]);
}
