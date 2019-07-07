import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blocksShape, blockShape, activeBlockShape } from '~client/prop-types/block-packer';
import BlockBits from '~client/components/BlockPacker/block-bits';

export function OuterBlockGroup({ block, activeMain, activeSub, ...props }) {
    const style = useMemo(() => ({
        width: block.width,
        height: block.height
    }), [block]);

    return (
        <div className="block-group" style={style}>
            {block.bits.map(blockBit => (
                <BlockBits
                    key={blockBit.name}
                    blockBit={blockBit}
                    activeMain={activeMain}
                    activeSub={activeSub}
                    {...props}
                />
            ))}
        </div>
    );
}

OuterBlockGroup.propTypes = {
    block: blockShape,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string
};

const Blocks = ({ blocks, activeBlock: [activeMain, activeSub], deepBlock, ...props }) => (
    <div className={classNames('block-tree', {
        'block-tree-deep': deepBlock,
        [`block-tree-${deepBlock}`]: deepBlock
    })}>
        {blocks.map(block => (
            <OuterBlockGroup
                key={block.bits[0].name}
                block={block}
                activeMain={activeMain}
                activeSub={activeSub}
                deep={deepBlock}
                {...props}
            />
        ))}
    </div>
);

Blocks.propTypes = {
    blocks: blocksShape,
    activeBlock: activeBlockShape,
    deepBlock: PropTypes.string
};

export default Blocks;
