import React, { memo, useMemo } from 'react';

import { createListContext } from './context';
import { useSortedItems, useMobileEditModal } from './hooks';
import { AccessibleListItem, AccessibleListCreateItem } from './item';
import { MobileCreateForm } from './mobile';
import * as Styled from './styles';
import type { Props, FieldKey, PropsMemoisedItem } from './types';
import { InfiniteWindow } from './window';

import { ModalDialog } from '~client/components/modal-dialog';
import { isStandardListPage } from '~client/constants/data';
import { useIsMobile } from '~client/hooks';
import type { PageList } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

const emptyObject = {};

export const AccessibleList = <
  I extends ListItemInput,
  P extends PageList,
  MK extends keyof I = never,
  E extends Record<string, unknown> = never,
  H extends Record<string, unknown> = Record<string, unknown>
>({
  page,
  onCreate,
  onUpdate,
  onDelete,
  windowise = false,
  color,
  fields,
  fieldsMobile,
  modalFields,
  sortItems,
  sortItemsPost,
  suggestionFields,
  deltaSeed,
  customSelector,
  itemProcessor,
  Row,
  Header,
  headerProps = emptyObject as H,
  FirstItem,
}: Props<I, P, MK, E, H>): React.ReactElement<Props<I, P, MK, E, H>> => {
  const isMobile = useIsMobile();
  const { itemsSorted, extraProps } = useSortedItems(
    page,
    sortItems,
    sortItemsPost,
    customSelector,
  );

  const ListContext = createListContext<E>();

  const fieldKeys = useMemo(() => Object.keys(fields) as FieldKey<I>[], [fields]);
  const fieldKeysMobile = useMemo(() => Object.keys(fieldsMobile ?? {}) as MK[], [fieldsMobile]);

  const editModal = useMobileEditModal(itemsSorted, onUpdate, onDelete);

  const MemoisedItem = useMemo<React.FC<PropsMemoisedItem<E>>>(() => {
    const ListItemComponent: React.FC<PropsMemoisedItem<E>> = ({
      id,
      style,
      odd,
      extraProps: itemExtraProps,
    }) => (
      <AccessibleListItem<I, P, MK, E>
        fields={fields}
        fieldsMobile={fieldsMobile}
        modalFields={modalFields}
        id={id}
        page={page}
        isMobile={isMobile}
        style={style}
        odd={odd}
        extraProps={itemExtraProps}
        onUpdate={onUpdate}
        onDelete={onDelete}
        itemProcessor={itemProcessor}
        Row={Row}
        onActivateModal={editModal.activate}
      />
    );
    return memo(ListItemComponent);
  }, [
    fields,
    fieldsMobile,
    modalFields,
    page,
    isMobile,
    onUpdate,
    onDelete,
    itemProcessor,
    editModal.activate,
    Row,
  ]);

  return (
    <ListContext.Provider value={extraProps}>
      <Styled.Base color={color}>
        {Header && (
          <Header
            isMobile={isMobile}
            page={page}
            fields={fieldKeys}
            fieldsMobile={fieldKeysMobile}
            {...headerProps}
          />
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
        {!windowise && (
          <Styled.List>
            {FirstItem && <FirstItem />}
            {itemsSorted.map(({ id }, index) => (
              <MemoisedItem key={id} id={id} odd={index % 2 === 1} extraProps={extraProps[id]} />
            ))}
          </Styled.List>
        )}
        {windowise && isStandardListPage(page) && (
          <InfiniteWindow
            page={page}
            isMobile={isMobile}
            items={itemsSorted}
            MemoisedItem={MemoisedItem}
          />
        )}
        {isMobile && (
          <>
            <MobileCreateForm page={page} color={color} fields={modalFields} onCreate={onCreate} />
            <ModalDialog<I>
              active={editModal.active}
              type="edit"
              id={editModal.item?.id}
              item={editModal.item}
              fields={modalFields}
              onCancel={editModal.onCancel}
              onSubmit={editModal.onSubmit}
              onRemove={editModal.onDelete}
            />
          </>
        )}
      </Styled.Base>
    </ListContext.Provider>
  );
};
