import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blocksShape, blockShape } from '~client/prop-types/block-packer';
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
                    active={activeMain === blockBit.name}
                    activeSub={activeMain === blockBit.name
                        ? activeSub
                        : null
                    }
                    {...props}
                />
            ))}
        </div>
    );
}

OuterBlockGroup.propTypes = {
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    block: blockShape
};

const Blocks = ({
    blocks,
    deepBlock,
    ...props
}) => (
    <div className={classNames('block-tree', {
        'block-tree-deep': deepBlock,
        [`block-tree-${deepBlock}`]: deepBlock
    })}>
        {blocks.map(block => (
            <OuterBlockGroup
                key={block.bits[0].name}
                block={block}
                deep={deepBlock}
                {...props}
            />
        ))}
    </div>
);

Blocks.propTypes = {
    blocks: blocksShape,
    deepBlock: PropTypes.string
};

export default Blocks;
