import React, { useMemo, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleListItem, AccessibleListCreateItem } from './item';
import { MobileCreateForm } from './mobile';
import { getItems } from './selectors';
import * as Styled from './styles';
import { Props, FieldKey } from './types';
import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import ModalDialog from '~client/components/ModalDialog';
import { useListCrud } from '~client/hooks/crud';
import { useIsMobile } from '~client/hooks/media';
import { Item, Create } from '~client/types';

const identitySelector = <E extends {}>(): { [id: string]: Partial<E> } => ({});

export const AccessibleList = <
  I extends Item,
  P extends string,
  MK extends keyof I = never,
  E extends {} = {}
>({
  page,
  color,
  fields,
  fieldsMobile,
  modalFields,
  sortItems,
  sortItemsPost,
  suggestionFields,
  deltaSeed,
  customSelector = identitySelector,
  itemProcessor,
  Row,
  Header,
}: Props<I, P, MK, E>): React.ReactElement<Props<I, P, MK, E>> => {
  const isMobile = useIsMobile();
  const itemsSortedPre: I[] = useSelector(getItems<I, P>(page, sortItems));

  const extraProps = useMemo<{ [id: string]: Partial<E> }>(() => customSelector(itemsSortedPre), [
    itemsSortedPre,
    customSelector,
  ]);

  const itemsSorted: I[] = useMemo<I[]>(
    () => (sortItemsPost ? sortItemsPost(itemsSortedPre, extraProps) : itemsSortedPre),
    [itemsSortedPre, extraProps, sortItemsPost],
  );

  const [onCreate, onUpdate, onDelete] = useListCrud<I, P>(
    listItemCreated<I, P>(page),
    listItemUpdated<I, P>(page),
    listItemDeleted<I, P>(page),
  );

  const fieldKeys = useMemo(() => Object.keys(fields) as FieldKey<I>[], [fields]);
  const fieldKeysMobile = useMemo(() => Object.keys(fieldsMobile ?? {}) as MK[], [fieldsMobile]);

  // used for mobile modal dialog only
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const onCancelModal = useCallback(() => setEditingIndex(-1), []);
  const activateModal = useCallback(
    (id: string) => setEditingIndex(itemsSorted.findIndex((item) => item.id === id)),
    [itemsSorted],
  );

  const editingItem = itemsSorted[editingIndex];
  const onSubmitModal = useCallback(
    (delta: Create<I>): void => {
      if (!editingItem) {
        return;
      }
      setEditingIndex(-1);
      onUpdate(editingItem.id, delta, editingItem);
    },
    [editingItem, onUpdate],
  );

  const onDeleteModal = useCallback((): void => {
    if (!editingItem) {
      return;
    }
    setEditingIndex(-1);
    onDelete(editingItem.id, editingItem);
  }, [editingItem, onDelete]);

  return (
    <Styled.Base color={color}>
      {Header && (
        <Header isMobile={isMobile} page={page} fields={fieldKeys} fieldsMobile={fieldKeysMobile} />
      )}
      {!isMobile && (
        <AccessibleListCreateItem<I, P, E>
          page={page}
          fields={fields}
          onCreate={onCreate}
          suggestionFields={suggestionFields}
          deltaSeed={deltaSeed}
        />
      )}
      <Styled.List>
        {itemsSorted.map(({ id }) => (
          <AccessibleListItem<I, P, MK, E>
            key={id}
            fields={fields}
            fieldsMobile={fieldsMobile}
            modalFields={modalFields}
            id={id}
            page={page}
            isMobile={isMobile}
            onUpdate={onUpdate}
            onDelete={onDelete}
            extraProps={extraProps[id]}
            itemProcessor={itemProcessor}
            Row={Row}
            onActivateModal={activateModal}
          />
        ))}
      </Styled.List>
      {isMobile && (
        <>
          <MobileCreateForm page={page} color={color} fields={modalFields} onCreate={onCreate} />
          <ModalDialog<I>
            active={editingIndex !== -1}
            type="edit"
            id={editingItem?.id}
            item={editingItem}
            fields={modalFields}
            onCancel={onCancelModal}
            onSubmit={onSubmitModal}
            onRemove={onDeleteModal}
          />
        </>
      )}
    </Styled.Base>
  );
};
