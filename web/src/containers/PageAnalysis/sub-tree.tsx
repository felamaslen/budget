import React, { useCallback } from 'react';

import { formatCurrency } from '~client/modules/format';

import * as Styled from './styles';
import { MainBlockName } from './types';

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

const SubTree: React.FC<Props> = ({ open, subTree, name, itemCost, onHover }) => {
  const makeOnMouseOver = useCallback(subItemName => (): void => onHover(name, subItemName), [
    onHover,
    name,
  ]);

  const onMouseOut = useCallback(() => onHover(null), [onHover]);

  if (!(open && subTree)) {
    return null;
  }

  return (
    <Styled.SubTree>
      {subTree.map(({ name: subItemName, total }) => (
        <Styled.TreeListItem
          key={subItemName}
          onMouseOver={makeOnMouseOver(subItemName)}
          onMouseOut={onMouseOut}
          onTouchStart={makeOnMouseOver(subItemName)}
          onTouchEnd={onMouseOut}
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
      ))}
    </Styled.SubTree>
  );
};

export default SubTree;
