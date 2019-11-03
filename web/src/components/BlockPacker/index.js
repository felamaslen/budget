import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { blocksShape } from '~client/prop-types/block-packer';
import Blocks from '~client/components/BlockPacker/blocks';

import * as Styled from './styles';

export default function BlockPacker({ status, onHover, blocks, ...props }) {
    const onMouseOut = useCallback(() => onHover(null, null), [onHover]);

    return (
        <Styled.BlockView onMouseOut={onMouseOut} onTouchEnd={onMouseOut}>
            <Styled.BlockTreeOuter>
                {blocks && (
                    <Blocks
                        blocks={blocks}
                        onHover={onHover}
                        {...props}
                    />
                )}
            </Styled.BlockTreeOuter>
            <Styled.StatusBar>{status}</Styled.StatusBar>
        </Styled.BlockView>
    );
}

BlockPacker.propTypes = {
    blocks: blocksShape,
    status: PropTypes.string,
    onHover: PropTypes.func.isRequired,
};
