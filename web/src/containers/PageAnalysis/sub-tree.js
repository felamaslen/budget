import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '~client/modules/format';

export default function SubTree({ open, subTree, name, itemCost, onHover }) {
    if (!open) {
        return null;
    }

    const subTreeItems = subTree.map((subItem, subKey) => {
        const subItemTotal = subItem.get('total');
        const subItemPct = (100 * subItemTotal / itemCost).toFixed(1);
        const subItemName = subItem.get('name');

        const onMouseOver = () => onHover([name, subItemName]);
        const onMouseOut = () => onHover(null);

        return <li key={subKey} className="tree-list-item"
            onMouseOver={onMouseOver} onMouseOut={onMouseOut}
            onTouchStart={onMouseOver} onTouchEnd={onMouseOut}>

            <div className="main">
                <span className="title">{subItemName}</span>
                <span className="cost">{formatCurrency(subItemTotal)}</span>
                <span className="pct">{' ('}{subItemPct}{'%)'}</span>
            </div>
        </li>;
    });

    return <ul className="sub-tree">
        {subTreeItems}
    </ul>;
}

SubTree.propTypes = {
    open: PropTypes.bool.isRequired,
    subTree: PropTypes.instanceOf(list),
    name: PropTypes.string,
    itemCost: PropTypes.number,
    onHover: PropTypes.func.isRequired
};

