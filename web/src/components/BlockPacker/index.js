import './style.scss';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { blocksShape, activeBlockShape } from '~client/components/BlockPacker/prop-types';
import Blocks from '~client/components/BlockPacker/blocks';

export default function BlockPacker({ status, onHover, ...props }) {
    const onMouseOut = useCallback(() => onHover(null, null), [onHover]);

    const blocks = props.blocks
        ? <Blocks onHover={onHover} {...props} />
        : null;

    return <div className="block-view" onMouseOut={onMouseOut} onTouchEnd={onMouseOut}>
        <div className="block-tree-outer">
            {blocks}
        </div>
        <div className="status-bar">
            <span className="inner">{status}</span>
        </div>
    </div>;
}

BlockPacker.propTypes = {
    page: PropTypes.string.isRequired,
    blocks: blocksShape,
    activeBlock: activeBlockShape,
    deep: PropTypes.string,
    status: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};
