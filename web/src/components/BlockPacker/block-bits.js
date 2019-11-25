import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';

import { blockBitShape, subBlockShape, subBlockBitShape } from '~client/prop-types/block-packer';

import * as Styled from './styles';

function SubBlockComponent({
    name, subBlockBit, active, onHover,
}) {
    const onBlockHover = useCallback(() => onHover(name, subBlockBit.name), [onHover, name, subBlockBit.name]);

    return (
        <Styled.SubBlock
            width={subBlockBit.width}
            height={subBlockBit.height}
            active={active}
            onTouchStart={onBlockHover}
            onMouseOver={onBlockHover}
        />
    );
}

SubBlockComponent.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    subBlockBit: subBlockBitShape,
    active: PropTypes.bool,
    onHover: PropTypes.func.isRequired,
};

export const SubBlock = memo(SubBlockComponent);

const BlockGroupComponent = ({ subBlock, activeSub, ...props }) => (
    <Styled.BlockGroup
        width={subBlock.width}
        height={subBlock.height}
    >
        {subBlock.bits.map((subBlockBit) => (
            <SubBlock
                key={subBlockBit.name}
                subBlockBit={subBlockBit}
                active={activeSub === subBlockBit.name}
                {...props}
            />
        ))}
    </Styled.BlockGroup>
);

BlockGroupComponent.propTypes = {
    subBlock: subBlockShape,
    activeSub: PropTypes.string,
};

export const BlockGroup = memo(BlockGroupComponent);

const BlockBits = ({
    blockBit, active, activeSub, deep, onHover, onClick,
}) => (
    <Styled.Block
        width={blockBit.width}
        height={blockBit.height}
        color={blockBit.color}
        active={!activeSub && active}
        name={deep ? undefined : blockBit.name}
        onClick={() => onClick(blockBit.name, blockBit.color)}
    >
        {(blockBit.blocks || []).map((subBlock) => <BlockGroup
            key={subBlock.bits[0].name}
            activeSub={activeSub}
            name={blockBit.name}
            value={blockBit.value}
            subBlock={subBlock}
            onHover={onHover}
        />)}
    </Styled.Block>
);

BlockBits.propTypes = {
    blockBit: blockBitShape,
    active: PropTypes.bool,
    activeSub: PropTypes.string,
    deep: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default memo(BlockBits);
