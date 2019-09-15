import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { blocksShape } from '~client/prop-types/block-packer';
import Blocks from '~client/components/BlockPacker/blocks';

import './style.scss';

export default function BlockPacker({ status, onHover, ...props }) {
    const onMouseOut = useCallback(() => onHover(null, null), [onHover]);

    return (
        <div className="block-view" onMouseOut={onMouseOut} onTouchEnd={onMouseOut}>
            <div className="block-tree-outer">
                {props.blocks && <Blocks onHover={onHover} {...props} />}
            </div>
            <div className="status-bar">
                <span className="inner">{status}</span>
            </div>
        </div>
    );
}

BlockPacker.propTypes = {
    blocks: blocksShape,
    status: PropTypes.string,
    onHover: PropTypes.func.isRequired,
};
