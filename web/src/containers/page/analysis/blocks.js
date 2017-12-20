import { List as list } from 'immutable';
import { connect } from 'react-redux';

import { aBlockClicked } from '../../../actions/analysis.actions';
import { aContentBlockHovered } from '../../../actions/content.actions';

import React from 'react';
import PropTypes from 'prop-types';

import BlockPacker from '../../../components/block-packer';

export function Blocks({ active, blocks, deep, status, onClick, onHover }) {
    return <BlockPacker
        page="analysis"
        activeBlock={active}
        blocks={blocks}
        deepBlock={deep}
        status={status}
        onClick={onClick}
        onHover={onHover} />;
}

Blocks.propTypes = {
    page: PropTypes.string.isRequired,
    blocks: PropTypes.instanceOf(list),
    status: PropTypes.string,
    active: PropTypes.array,
    deep: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onHover: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    active: state.getIn(['other', 'blockView', 'active']),
    blocks: state.getIn(['other', 'blockView', 'blocks']),
    deep: state.getIn(['other', 'blockView', 'deep']),
    status: state.getIn(['other', 'blockView', 'status'])
});

const mapDispatchToProps = dispatch => ({
    onClick: req => dispatch(aBlockClicked(req)),
    onHover: (block, subBlock) => dispatch(aContentBlockHovered({ block, subBlock }))
});

export default connect(mapStateToProps, mapDispatchToProps)(Blocks);

