import { connect } from 'react-redux';

import { PAGES } from '../../misc/const';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Editable from '.';

function ListAddEditItem({ active, ...props }) {
    return <span className={classNames(props.item, { active })}>
        <Editable {...props} />
    </span>;
}

ListAddEditItem.propTypes = {
    page: PropTypes.string.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    active: PropTypes.bool.isRequired
};

const mapStateToProps = (state, { page, row, col }) => ({
    value: state.getIn(['edit', 'add', page, col]),
    active: state.getIn(['edit', 'row']) === row &&
        state.getIn(['edit', 'col']) === col,
    item: PAGES[page].cols[col]
});

export default connect(mapStateToProps)(ListAddEditItem);

