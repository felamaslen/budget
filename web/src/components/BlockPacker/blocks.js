import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

import { blocksShape, blockShape } from '~client/prop-types/block-packer';
import BlockBits from '~client/components/BlockPacker/block-bits';

import * as Styled from './styles';

const OuterBlockGroupComponent = ({
    block,
    activeMain,
    activeSub,
    onClick,
    onHover,
}) => {
    const blockRef = useRef();
    const onClickBlock = useCallback((name, color) => {
        if (!blockRef.current) {
            return;
        }

        const preview = {
            left: blockRef.current.offsetLeft,
            top: blockRef.current.offsetTop,
            width: block.width,
            height: block.height,
            name,
            color,
        };

        onClick(name, preview);
    }, [onClick, block.width, block.height]);

    return (
        <Styled.BlockGroup
            ref={blockRef}
            width={block.width}
            height={block.height}
        >
            {block.bits.map((blockBit) => (
                <BlockBits
                    key={blockBit.name}
                    blockBit={blockBit}
                    active={activeMain === blockBit.name}
                    activeSub={activeMain === blockBit.name
                        ? activeSub
                        : null
                    }
                    onClick={onClickBlock}
                    onHover={onHover}
                />
            ))}
        </Styled.BlockGroup>
    );
};

OuterBlockGroupComponent.propTypes = {
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    block: blockShape,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired,
};

export const OuterBlockGroup = React.memo(OuterBlockGroupComponent);

const Blocks = ({
    deep,
    blocks,
    activeMain,
    activeSub,
    onHover,
    onClick,
}) => (
    <Styled.BlockTree deep={deep}>
        {blocks.map((block) => (
            <OuterBlockGroup
                key={block.bits[0].name}
                block={block}
                activeMain={block.bits && block.bits.some(({ name }) => name === activeMain)
                    ? activeMain
                    : null
                }
                activeSub={block.bits && block.bits.some(({ name, blocks: subBlocks }) => name === activeMain
                    && subBlocks
                    && subBlocks.some(({ bits: subBits }) => (
                        subBits && subBits.some(({ name: subName }) => subName === activeSub)
                    )))
                    ? activeSub
                    : null
                }
                onHover={onHover}
                onClick={onClick}
            />
        ))}
    </Styled.BlockTree>
);

Blocks.propTypes = {
    deep: PropTypes.bool,
    blocks: blocksShape,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

Blocks.defaultProps = {
    deep: false,
};

export default Blocks;
