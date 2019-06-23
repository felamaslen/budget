import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blocksShape, blockShape, activeBlockShape } from '~client/components/BlockPacker/prop-types';
import BlockBits from '~client/components/BlockPacker/block-bits';

export function OuterBlockGroup({ block, activeMain, activeSub, activeBlock, ...props }) {
    const style = useMemo(() => ({
        width: block.width,
        height: block.height
    }), [block]);

    const blockBits = block.bits.map(blockBit => <BlockBits
        key={blockBit.name}
        blockBit={blockBit}
        activeMain={activeMain}
        activeSub={activeSub}
        activeBlock={activeBlock}
        {...props}
    />);

    return <div className="block-group" style={style}>
        {blockBits}
    </div>;
}

OuterBlockGroup.propTypes = {
    block: blockShape,
    activeMain: PropTypes.bool.isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: PropTypes.array
};

export default function Blocks({ blocks, activeBlock, deep, ...props }) {
    const activeMain = Boolean(activeBlock && activeBlock.length === 1);
    const activeSub = Boolean(activeBlock && activeBlock.length === 2);
    const activeDeep = Boolean(deep);

    const className = classNames('block-tree', {
        'block-tree-deep': activeDeep,
        [`block-tree-${deep}`]: activeDeep
    });

    const blocksList = blocks.map((block, key) => <OuterBlockGroup
        key={key}
        block={block}
        activeMain={activeMain}
        activeSub={activeSub}
        activeBlock={activeBlock}
        deep={deep}
        {...props}
    />);

    return <div className={className}>{blocksList}</div>;
}

Blocks.propTypes = {
    blocks: blocksShape,
    activeBlock: activeBlockShape,
    deep: PropTypes.string
};
