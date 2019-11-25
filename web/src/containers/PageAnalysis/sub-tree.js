import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency } from '~client/modules/format';
import { subTreeShape } from '~client/prop-types/page/analysis';

import * as Styled from './styles';

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
                        <Styled.TreeValue>{' ('}{(100 * (total / itemCost)).toFixed(1)}{'%)'}</Styled.TreeValue>
                    </Styled.TreeMain>
                </Styled.TreeListItem>
            ))}
        </Styled.SubTree>
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
