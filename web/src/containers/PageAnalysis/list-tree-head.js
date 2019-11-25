import React from 'react';

import { formatCurrency } from '~client/modules/format';
import { listTreeHeadItemsShape } from '~client/prop-types/page/analysis';

import * as Styled from './styles';

export default function ListTreeHead({ items }) {
    const getCost = (itemList) => formatCurrency(itemList
        .reduce((last, { itemCost }) => last + itemCost, 0));

    const getPct = (itemList) => itemList
        .reduce((last, { pct }) => last + pct, 0)
        .toFixed(1);

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
}

ListTreeHead.propTypes = {
    items: listTreeHeadItemsShape,
};
