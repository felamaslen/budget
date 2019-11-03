import React from 'react';
import PropTypes from 'prop-types';

import { blocksShape, blockShape } from '~client/prop-types/block-packer';
import BlockBits from '~client/components/BlockPacker/block-bits';

import * as Styled from './styles';

const OuterBlockGroupComponent = ({
    block, activeMain, activeSub, ...props
}) => (
    <Styled.BlockGroup
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
                {...props}
            />
        ))}
    </Styled.BlockGroup>
);

OuterBlockGroupComponent.propTypes = {
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    block: blockShape,
};

export const OuterBlockGroup = React.memo(OuterBlockGroupComponent);

const Blocks = ({
    blocks,
    deepBlock,
    activeMain,
    activeSub,
    ...props
}) => (
    <Styled.BlockTree>
        {blocks.map((block) => (
            <OuterBlockGroup
                key={block.bits[0].name}
                block={block}
                deep={deepBlock}
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
                {...props}
            />
        ))}
    </Styled.BlockTree>
);

Blocks.propTypes = {
    blocks: blocksShape,
    deepBlock: PropTypes.string,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
};

export default Blocks;
