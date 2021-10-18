import React, { useCallback } from 'react';

import { CrudProps } from '~client/hooks';
import type { Id, SetActiveId, WithIds } from '~client/types';

export type ItemComponent<
  I extends Record<string, unknown>,
  J extends WithIds<I>,
  E extends Record<string, unknown>,
> = React.FC<
  E &
    Pick<CrudProps<I>, 'onUpdate'> & {
      onDelete: (event?: React.BaseSyntheticEvent) => void;
      style?: Record<string, unknown>;
      odd: boolean;
      item: J;
      active: boolean;
      noneActive: boolean;
      setActive: (id: Id | null) => void;
    }
>;

export type Props<
  I extends Record<string, unknown>,
  J extends WithIds<I> = WithIds<I>,
  E extends Record<string, unknown> = Record<string, unknown>,
> = Omit<CrudProps<I>, 'onCreate'> & {
  activeId: number | null;
  item: J;
  extraProps?: E;
  Item: ItemComponent<I, J, E>;
  odd: boolean;
  setActive: SetActiveId;
};

const CrudListItem = <
  I extends Record<string, unknown>,
  J extends WithIds<I>,
  E extends Record<string, unknown> = Record<string, unknown>,
>({
  activeId,
  item,
  extraProps = {} as E,
  Item,
  setActive,
  onUpdate,
  onDelete,
  odd,
}: Props<I, J, E>): React.ReactElement => {
  const active = activeId === item.id;
  const noneActive = activeId === null;

  const onDeleteCallback = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation();
      }
      onDelete(item.id);
      setActive(null);
    },
    [item, setActive, onDelete],
  );

  return (
    <Item
      odd={odd}
      item={item}
      active={active}
      noneActive={noneActive}
      setActive={setActive}
      onUpdate={onUpdate}
      onDelete={onDeleteCallback}
      {...extraProps}
    />
  );
};

export default CrudListItem;
