/**
 * Block packer component
 */

import { List as list } from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';

import Blocks from './blocks';

export default function BlockPacker({ status, ...props }) {
    const onMouseOut = () => props.onHover(null, null);

    const blocks = props.blocks
        ? <Blocks {...props} />
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
    pageIndex: PropTypes.number.isRequired,
    blocks: PropTypes.instanceOf(list),
    activeBlock: PropTypes.array,
    deepBlock: PropTypes.string,
    status: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};

