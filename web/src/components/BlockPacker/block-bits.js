import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { blockBitShape, subBlockShape, subBlockBitShape } from '~client/prop-types/block-packer';

export function SubBlock({ name, subBlockBit, activeMain, activeSub, onHover }) {
    const style = useMemo(() => ({
        width: subBlockBit.width,
        height: subBlockBit.height
    }), [subBlockBit]);

    const onBlockHover = useCallback(() => onHover(name, subBlockBit.name), [onHover, name, subBlockBit.name]);

    return <div
        className={classNames('sub-block', {
            active: activeMain === name && activeSub === subBlockBit.name
        })}
        style={style}
        onTouchStart={onBlockHover}
        onMouseOver={onBlockHover}
    />;
}

SubBlock.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    subBlockBit: subBlockBitShape,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
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

export default function BlockBits({ blockBit, activeMain, activeSub, deep, onClick, ...props }) {
    const style = useMemo(() => ({
        width: blockBit.width,
        height: blockBit.height
    }), [blockBit]);

    return (
        <div
            className={classNames('block', `block-${blockBit.color}`, {
                active: activeMain === blockBit.name && !activeSub,
                [`block-${blockBit.name}`]: !deep
            })}
            style={style}
            onClick={() => onClick(activeMain, blockBit.name)}
        >
            {(blockBit.blocks || []).map((subBlock, key) => <BlockGroup
                key={key}
                activeMain={activeMain}
                activeSub={activeSub}
                name={blockBit.name}
                value={blockBit.value}
                subBlock={subBlock}
                {...props}
            />)}
        </div>
    );
}

BlockBits.propTypes = {
    blockBit: blockBitShape,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    deep: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired
};
