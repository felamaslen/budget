import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../../misc/format';

export default function ListTreeHead({ items }) {
    const getCost = itemList =>
        formatCurrency(itemList.reduce((last, item) => last + item.itemCost, 0));

    const getPct = itemList =>
        itemList.reduce((last, item) => last + item.pct, 0).toFixed(1);

    const itemsSelected = items.filter(item => item.visible);

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
    items: PropTypes.instanceOf(list)
};

