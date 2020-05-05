import React from 'react';

import { formatCurrency } from '~client/modules/format';

import * as Styled from './styles';

type ListTreeHeadItem = {
  itemCost: number;
  pct: number;
  visible: boolean;
};

type Props = {
  items: ListTreeHeadItem[];
};

const getCost = (itemList: ListTreeHeadItem[]): string =>
  formatCurrency(itemList.reduce((last, { itemCost }) => last + itemCost, 0));

const getPct = (itemList: ListTreeHeadItem[]): string =>
  itemList.reduce((last, { pct }) => last + pct, 0).toFixed(1);

const ListTreeHead: React.FC<Props> = ({ items }) => {
  const itemsSelected = items.filter(({ visible }) => visible);

  const costTotal = getCost(items);
  const pctTotal = getPct(items);

  const costSelected = getCost(itemsSelected);
  const pctSelected = getPct(itemsSelected);

  return (
    <Styled.TreeListHeadItem>
      <Styled.TreeListItemInner>
        <Styled.TreeIndicator />
        <Styled.TreeTitle>{'Total:'}</Styled.TreeTitle>
        <Styled.TreeValue>
          <div>{costTotal}</div>
          <Styled.TreeListSelected>{costSelected}</Styled.TreeListSelected>
        </Styled.TreeValue>
        <Styled.TreeValue>
          <div>{pctTotal}%</div>
          <Styled.TreeListSelected>{pctSelected}%</Styled.TreeListSelected>
        </Styled.TreeValue>
      </Styled.TreeListItemInner>
    </Styled.TreeListHeadItem>
  );
};

export default ListTreeHead;
