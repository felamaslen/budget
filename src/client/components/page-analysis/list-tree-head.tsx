import React from 'react';

import * as Styled from './styles';
import { Props as SubTreeProps } from './sub-tree';
import { formatCurrency, formatPercent } from '~client/modules/format';

export type ListTreeHeadItem = Pick<SubTreeProps, 'name' | 'itemCost' | 'subTree'> & {
  ratio: number;
  visible: boolean;
  open: boolean;
};

export type Props = {
  income: number;
  items: ListTreeHeadItem[];
};

const getCost = (itemList: ListTreeHeadItem[]): number =>
  itemList.reduce((last, { itemCost }) => last + itemCost, 0);

const ListTreeHead: React.FC<Props> = ({ income, items }) => {
  const costTotal = getCost(items);

  return (
    <Styled.TreeListHeadItem>
      <Styled.TreeListItemInner>
        <Styled.TreeIndicator />
        <Styled.TreeTitle>Income:</Styled.TreeTitle>
        <Styled.TreeValue>
          <div>{formatCurrency(income)}</div>
        </Styled.TreeValue>
        <Styled.TreeValue>
          <div>(100%)</div>
        </Styled.TreeValue>
      </Styled.TreeListItemInner>
      <Styled.TreeListItemInner>
        <Styled.TreeIndicator />
        <Styled.TreeTitle>Expenses:</Styled.TreeTitle>
        <Styled.TreeValue>
          <div>{formatCurrency(costTotal)}</div>
        </Styled.TreeValue>
        <Styled.TreeValue>
          <div>({formatPercent(income ? costTotal / income : 0, { precision: 1 })})</div>
        </Styled.TreeValue>
      </Styled.TreeListItemInner>
    </Styled.TreeListHeadItem>
  );
};

export default ListTreeHead;
