import { connect } from 'react-redux';

import { LIST_COLS_PAGES } from '../../misc/const';

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import getEditable from '.';

export function ListAddEditItem({ pageIndex, row, col, id, item, value, active, noSuggestions }) {
    const Editable = getEditable({ row, col, id, item, value });

    const spanClasses = classNames({
        [item]: true,
        active
    });

    return <span className={spanClasses}>
        <Editable pageIndex={pageIndex} noSuggestions={noSuggestions} />
    </span>;
}

ListAddEditItem.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    id: PropTypes.number,
    item: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    active: PropTypes.bool.isRequired,
    noSuggestions: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
    value: state.getIn(['edit', 'add', ownProps.pageIndex, ownProps.col]),
    active: state.getIn(['edit', 'row']) === ownProps.row &&
        state.getIn(['edit', 'col']) === ownProps.col,
    item: LIST_COLS_PAGES[ownProps.pageIndex][ownProps.col]
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ListAddEditItem);

