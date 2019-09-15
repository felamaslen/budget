import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '~client/modules/format';
import { subTreeShape } from '~client/prop-types/page/analysis';

export default function SubTree({
    open, subTree, name, itemCost, onHover,
}) {
    const makeOnMouseOver = useCallback(
        (subItemName) => () => onHover(name, subItemName),
        [onHover, name],
    );

    const onMouseOut = useCallback(() => onHover(null), [onHover]);

    if (!(open && subTree)) {
        return null;
    }

    return (
        <ul className="sub-tree">
            {subTree.map(({ name: subItemName, total }) => (
                <li key={subItemName}
                    className="tree-list-item"
                    onMouseOver={makeOnMouseOver(subItemName)}
                    onMouseOut={onMouseOut}
                    onTouchStart={makeOnMouseOver(subItemName)}
                    onTouchEnd={onMouseOut}
                >
                    <div className="main">
                        <span className="title">{subItemName}</span>
                        <span className="cost">{formatCurrency(total)}</span>
                        <span className="pct">{' ('}{(100 * (total / itemCost)).toFixed(1)}{'%)'}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

SubTree.propTypes = {
    open: PropTypes.bool.isRequired,
    subTree: subTreeShape,
    name: PropTypes.string,
    itemCost: PropTypes.number,
    onHover: PropTypes.func.isRequired,
};

SubTree.defaultProps = {
    subTree: null,
};
