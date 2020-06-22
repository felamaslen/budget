import React, { useState } from 'react';

import CrudListItem, { ItemComponent } from './item';

import * as Styled from './styles';
import { CREATE_ID } from '~client/constants/data';
import { CrudProps } from '~client/hooks';
import { Id, Item as ItemType } from '~client/types';

type MetaProps<I extends ItemType, E extends {}> = E &
  Partial<
    CrudProps<I> & {
      active: number | null;
      setActive: (id: Id | null) => void;
      activeItem?: I;
    }
  >;

type Props<I extends ItemType, E extends {} = {}> = CrudProps<I> & {
  items: I[];
  Item: ItemComponent<I, E>;
  CreateItem: React.FC<
    E &
      Pick<CrudProps<I>, 'onCreate'> & {
        active: boolean;
        noneActive: boolean;
        setActive: (id: Id | null) => void;
      }
  >;
  BeforeList?: React.FC<MetaProps<I, E>>;
  AfterList?: React.FC<MetaProps<I, E>>;
  extraProps?: E;
};

export const CrudList = <I extends ItemType, E extends {} = {}>({
  items,
  Item,
  CreateItem,
  BeforeList,
  AfterList,
  onCreate,
  onUpdate,
  onDelete,
  extraProps = {} as E,
}: Props<I, E>): React.ReactElement<Props<I, E>> => {
  const [activeId, setActive] = useState<number | null>(null);
  const noneActive = activeId === null;
  const createActive = activeId === CREATE_ID;
  const activeItem = items.find(({ id }) => id === activeId);

  const metaProps: MetaProps<I, E> = {
    active: activeId,
    setActive,
    activeItem,
    onCreate,
    onUpdate,
    onDelete,
    ...extraProps,
  };

  const active = activeId !== null;

  return (
    <Styled.CrudList active={active}>
      {BeforeList && <BeforeList {...metaProps} />}
      <Styled.CrudListInner active={active}>
        <Styled.CrudWindow active={active} createActive={createActive}>
          {items.map((item, index) => (
            <CrudListItem<I, E>
              key={item.id}
              Item={Item}
              activeId={activeId}
              setActive={setActive}
              item={item}
              odd={index % 2 === 1}
              extraProps={extraProps}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </Styled.CrudWindow>
        <CreateItem
          active={createActive}
          noneActive={noneActive}
          setActive={setActive}
          onCreate={onCreate}
          {...extraProps}
        />
      </Styled.CrudListInner>
      {AfterList && <AfterList {...metaProps} />}
    </Styled.CrudList>
  );
};
