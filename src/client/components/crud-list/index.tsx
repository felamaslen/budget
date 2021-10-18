import React, { useState } from 'react';

import CrudListItem, { Props as ItemProps } from './item';

import * as Styled from './styles';
import { CREATE_ID } from '~client/constants/data';
import { CrudProps } from '~client/hooks';
import type { SetActiveId, WithIds } from '~client/types';

type MetaProps<
  I extends Record<string, unknown>,
  J extends WithIds<I>,
  E extends Record<string, unknown>,
> = E &
  Partial<
    CrudProps<I> & {
      active: number | null;
      setActive: SetActiveId;
      activeItem?: J;
    }
  >;

type Props<
  I extends Record<string, unknown>,
  J extends WithIds<I> = WithIds<I>,
  E extends Record<string, unknown> = Record<string, unknown>,
> = CrudProps<I> &
  Pick<ItemProps<I, J, E>, 'Item' | 'extraProps'> & {
    items: J[];
    CreateItem: React.FC<
      E &
        Pick<CrudProps<I>, 'onCreate'> & {
          active: boolean;
          noneActive: boolean;
          setActive: SetActiveId;
        }
    >;
    BeforeList?: React.FC<MetaProps<I, J, E>>;
    AfterList?: React.FC<MetaProps<I, J, E>>;
  };

export const CrudList = <
  I extends Record<string, unknown>,
  J extends WithIds<I> = WithIds<I>,
  E extends Record<string, unknown> = Record<string, unknown>,
>({
  items,
  Item,
  CreateItem,
  BeforeList,
  AfterList,
  onCreate,
  onUpdate,
  onDelete,
  extraProps = {} as E,
}: Props<I, J, E>): React.ReactElement => {
  const [activeId, setActive] = useState<number | null>(null);
  const noneActive = activeId === null;
  const createActive = activeId === CREATE_ID;
  const activeItem = items.find(({ id }) => id === activeId);

  const metaProps: MetaProps<I, J, E> = {
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
            <CrudListItem<I, J, E>
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
