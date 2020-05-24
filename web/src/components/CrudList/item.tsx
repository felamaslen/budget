import React, { useCallback } from 'react';

import { CrudProps } from '~client/hooks/crud';

export type ItemComponent<I extends { id: string }, E extends {}> = React.FC<
  E &
    Pick<CrudProps<I>, 'onUpdate'> & {
      onDelete: (event?: React.BaseSyntheticEvent) => void;
      style?: object;
      odd: boolean;
      item: I;
      active: boolean;
      noneActive: boolean;
      setActive: (id: string | null) => void;
    }
>;

type Props<I extends { id: string }, E extends {} = {}> = Omit<CrudProps<I>, 'onCreate'> & {
  activeId: string | null;
  item: I;
  extraProps?: E;
  Item: ItemComponent<I, E>;
  odd: boolean;
  setActive: (id: string | null) => void;
};

const CrudListItem = <I extends { id: string }, E extends {} = {}>({
  activeId,
  item,
  extraProps = {} as E,
  Item,
  setActive,
  onUpdate,
  onDelete,
  odd,
}: Props<I, E>): React.ReactElement<Props<I, E>> => {
  const active = activeId === item.id;
  const noneActive = activeId === null;

  const onDeleteCallback = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation();
      }
      onDelete(item.id, item);
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
