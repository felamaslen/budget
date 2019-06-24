import { connect } from 'react-redux';
import { aBlockClicked } from '~client/actions/analysis.actions';
import { aContentBlockHovered } from '~client/actions/content.actions';
import React from 'react';
import PropTypes from 'prop-types';
import { blocksShape, activeBlockShape } from '~client/prop-types/block-packer';
import BlockPacker from '~client/components/BlockPacker';

export function Blocks(props) {
    return <BlockPacker page="analysis" {...props} />;
}

Blocks.propTypes = {
    blocks: blocksShape,
    status: PropTypes.string,
    activeBlock: activeBlockShape,
    deep: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    activeBlock: state.other.blockView.active,
    blocks: state.other.blockView.blocks,
    deep: state.other.blockView.deep,
    status: state.other.blockView.status
});

const mapDispatchToProps = dispatch => ({
    onClick: req => dispatch(aBlockClicked(req)),
    onHover: (block, subBlock) => dispatch(aContentBlockHovered({ block, subBlock }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Blocks);
