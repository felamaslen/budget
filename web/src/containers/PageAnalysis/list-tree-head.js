import React from 'react';

import { formatCurrency } from '~client/modules/format';
import { listTreeHeadItemsShape } from '~client/prop-types/page/analysis';

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

    return <li className="tree-list-item head">
        <div className="inner">
            <span className="indicator" />
            <span className="title">{'Total:'}</span>
            <span className="cost">
                <div className="total">{costTotal}</div>
                <div className="selected">{costSelected}</div>
            </span>
            <span className="pct">
                <div className="total">{pctTotal}%</div>
                <div className="selected">{pctSelected}%</div>
            </span>
        </div>
    </li>;
}

ListTreeHead.propTypes = {
    items: listTreeHeadItemsShape,
};
