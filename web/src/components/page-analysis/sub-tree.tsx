import React, { useCallback } from 'react';

import * as Styled from './styles';
import { formatCurrency } from '~client/modules/format';
import type { MainBlockName } from '~client/types';

export type Props = {
  open: boolean;
  name: MainBlockName;
  itemCost: number;
  subTree?: {
    name: string;
    total: number;
  }[];
  onHover: (name: MainBlockName | null, subItemName?: string) => void;
};

const SubTreeItem: React.FC<
  Pick<Props, 'name' | 'onHover' | 'itemCost'> & {
    subItemName: string;
    onDeactivate: () => void;
    total: number;
  }
> = ({ name, subItemName, onDeactivate, onHover, total, itemCost }) => {
  const onActivate = useCallback((): void => onHover(name, subItemName), [
    onHover,
    name,
    subItemName,
  ]);

  return (
    <Styled.TreeListItem
      key={subItemName}
      onFocus={onActivate}
      onMouseOver={onActivate}
      onTouchStart={onActivate}
      onBlur={onDeactivate}
      onMouseOut={onDeactivate}
      onTouchEnd={onDeactivate}
    >
      <Styled.TreeMain>
        <Styled.TreeTitle>{subItemName}</Styled.TreeTitle>
        <Styled.TreeValue>{formatCurrency(total)}</Styled.TreeValue>
        <Styled.TreeValue>
          {' ('}
          {(100 * (total / itemCost)).toFixed(1)}
          {'%)'}
        </Styled.TreeValue>
      </Styled.TreeMain>
    </Styled.TreeListItem>
  );
};

export const SubTree: React.FC<Props> = ({ open, subTree, name, itemCost, onHover }) => {
  const onDeactivate = useCallback(() => onHover(null), [onHover]);

  if (!(open && subTree)) {
    return null;
  }

  return (
    <Styled.SubTree>
      {subTree.map(({ name: subItemName, total }) => (
        <SubTreeItem
          key={subItemName}
          name={name}
          subItemName={subItemName}
          onHover={onHover}
          onDeactivate={onDeactivate}
          total={total}
          itemCost={itemCost}
        />
      ))}
    </Styled.SubTree>
  );
};
