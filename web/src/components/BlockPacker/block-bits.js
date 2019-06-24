import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blockBitShape, subBlockShape, subBlockBitShape, activeBlockShape } from '~client/prop-types/block-packer';

export function SubBlock({ name, value, subBlockBit, activeSub, activeBlock, onHover }) {
    const [activeName, activeSubName] = activeBlock || [];

    const active = activeSub && activeName === name && activeSubName === subBlockBit.name;

    const className = classNames('sub-block', { active });

    const style = useMemo(() => ({
        width: subBlockBit.width,
        height: subBlockBit.height
    }), [subBlockBit]);

    const onBlockHover = useCallback(() => onHover({ name, value }, subBlockBit), [onHover, name, value, subBlockBit]);

    return <div
        className={className}
        style={style}
        onTouchStart={onBlockHover}
        onMouseOver={onBlockHover}
    />;
}

SubBlock.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    subBlockBit: subBlockBitShape,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: activeBlockShape,
    onHover: PropTypes.func.isRequired
};

export function BlockGroup({ subBlock, ...props }) {
    const subBlockBits = subBlock.bits.map(subBlockBit => <SubBlock
        key={subBlockBit.name}
        subBlockBit={subBlockBit}
        {...props}
    />);

    const style = useMemo(() => ({
        width: subBlock.width,
        height: subBlock.height
    }), [subBlock]);

    return <div className="block-group" style={style}>
        {subBlockBits}
    </div>;
}

BlockGroup.propTypes = {
    subBlock: subBlockShape
};

export default function BlockBits({ page, blockBit, activeMain, activeBlock, deep, onClick, ...props }) {
    const className = classNames('block', `block-${blockBit.color}`, {
        active: activeMain && activeBlock[0] === blockBit.name,
        [`block-${blockBit.name}`]: !deep
    });

    const subBlocks = blockBit.blocks.map((subBlock, key) => <BlockGroup
        key={key}
        activeBlock={activeBlock}
        name={blockBit.name}
        value={blockBit.value}
        subBlock={subBlock}
        {...props}
    />);

    const style = useMemo(() => ({
        width: blockBit.width,
        height: blockBit.height
    }), [blockBit]);

    const onBlockClick = useCallback(() => onClick({
        wasDeep: Boolean(deep),
        page,
        name: blockBit.name
    }), [onClick, deep, page, blockBit]);

    return <div className={className} style={style}
        onClick={onBlockClick}>
        {subBlocks}
    </div>;
}

BlockBits.propTypes = {
    blockBit: blockBitShape,
    page: PropTypes.string.isRequired,
    activeMain: PropTypes.bool.isRequired,
    activeSub: PropTypes.bool.isRequired,
    activeBlock: activeBlockShape,
    deep: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};
