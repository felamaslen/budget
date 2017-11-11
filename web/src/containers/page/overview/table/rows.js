import { connect } from 'react-redux';

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

import Cells from './cells';

export function OverviewTableRows({ pageIndex, rows, numToSkip }) {
    const rowsDisplay = rows
        .slice(numToSkip)
        .map((row, key) => {
            const rowKey = key + numToSkip;

            return <Cells key={key} pageIndex={pageIndex} row={row} rowKey={rowKey} />;
        });

    return <div>{rowsDisplay}</div>;
}

OverviewTableRows.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    rows: PropTypes.instanceOf(list).isRequired,
    numToSkip: PropTypes.number.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    rows: state.getIn(['pages', ownProps.pageIndex, 'rows'])
});

export default connect(mapStateToProps)(OverviewTableRows);

