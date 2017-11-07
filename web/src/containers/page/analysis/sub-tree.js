import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { aTreeItemHovered } from '../../../actions/analysis.actions';
import React from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '../../../misc/format';

export function SubTree({ open, subTree, name, itemCost, onHoverTreeItem }) {
    if (!open) {
        return null;
    }

    const subTreeItems = subTree.map((subItem, subKey) => {
        const subItemTotal = subItem.get('total');
        const subItemPct = (100 * subItemTotal / itemCost).toFixed(1);
        const subItemName = subItem.get('name');

        const onMouseOver = () => onHoverTreeItem([name, subItemName]);
        const onMouseOut = () => onHoverTreeItem(null);

        return <li key={subKey} className="tree-list-item"
            onMouseOver={onMouseOver} onMouseOut={onMouseOut}
            onTouchStart={onMouseOver} onTouchEnd={onMouseOut}>

            <div className="main">
                <span className="title">{subItemName}</span>
                <span className="cost">{formatCurrency(subItemTotal)}</span>
                <span className="pct">&nbsp;({subItemPct}%)</span>
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
    onHoverTreeItem: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    onHoverTreeItem: req => dispatch(aTreeItemHovered(req))
});

export default connect(null, mapDispatchToProps)(SubTree);

