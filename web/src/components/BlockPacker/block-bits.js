import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blockBitShape, subBlockShape, subBlockBitShape } from '~client/prop-types/block-packer';

function SubBlockComponent({ name, subBlockBit, active, onHover }) {
    const style = useMemo(() => ({
        width: subBlockBit.width,
        height: subBlockBit.height
    }), [subBlockBit]);

    const onBlockHover = useCallback(() => onHover(name, subBlockBit.name), [onHover, name, subBlockBit.name]);

    return <div
        className={classNames('sub-block', { active })}
        style={style}
        onTouchStart={onBlockHover}
        onMouseOver={onBlockHover}
    />;
}

SubBlockComponent.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    subBlockBit: subBlockBitShape,
    active: PropTypes.bool,
    onHover: PropTypes.func.isRequired
};

export const SubBlock = React.memo(SubBlockComponent);

function BlockGroupComponent({ subBlock, activeSub, ...props }) {
    const subBlockBits = subBlock.bits.map(subBlockBit => <SubBlock
        key={subBlockBit.name}
        subBlockBit={subBlockBit}
        active={activeSub === subBlockBit.name}
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

BlockGroupComponent.propTypes = {
    subBlock: subBlockShape,
    activeSub: PropTypes.string
};

export const BlockGroup = React.memo(BlockGroupComponent);

function BlockBits({ blockBit, active, activeSub, deep, onHover, onClick }) {
    const style = useMemo(() => ({
        width: blockBit.width,
        height: blockBit.height
    }), [blockBit]);

    return (
        <div
            className={classNames('block', `block-${blockBit.color}`, {
                active: active && !activeSub,
                [`block-${blockBit.name}`]: !deep
            })}
            style={style}
            onClick={() => onClick(blockBit.name)}
        >
            {(blockBit.blocks || []).map(subBlock => <BlockGroup
                key={subBlock.bits[0].name}
                activeSub={activeSub}
                name={blockBit.name}
                value={blockBit.value}
                subBlock={subBlock}
                onHover={onHover}
            />)}
        </div>
    );
}

BlockBits.propTypes = {
    blockBit: blockBitShape,
    active: PropTypes.bool,
    activeSub: PropTypes.string,
    deep: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};

export default React.memo(BlockBits);
