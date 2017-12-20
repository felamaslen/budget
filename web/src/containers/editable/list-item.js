import { connect } from 'react-redux';

import { PAGES } from '../../misc/const';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from '.';

export function ListAddEditItem({ page, row, col, id, item, value, active }) {
    const Editable = getEditable({ row, col, id, item, value });

    return <span className={classNames(item, { active })}>
        <Editable page={page} />
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

const mapStateToProps = (state, ownProps) => ({
    value: state.getIn(['edit', 'add', ownProps.page, ownProps.col]),
    active: state.getIn(['edit', 'row']) === ownProps.row &&
        state.getIn(['edit', 'col']) === ownProps.col,
    item: PAGES[ownProps.page].cols[ownProps.col]
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ListAddEditItem);

