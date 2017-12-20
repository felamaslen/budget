import { connect } from 'react-redux';

import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

import Cells from './cells';

export function OverviewTableRows({ rows, numToSkip }) {
    const rowsDisplay = rows
        .slice(numToSkip)
        .map((row, key) => {
            const rowKey = key + numToSkip;

            return <Cells key={key} row={row} rowKey={rowKey} />;
        });

    return <div>{rowsDisplay}</div>;
}

OverviewTableRows.propTypes = {
    page: PropTypes.string.isRequired,
    rows: PropTypes.instanceOf(list).isRequired,
    numToSkip: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
    rows: state.getIn(['pages', 'overview', 'rows'])
});

export default connect(mapStateToProps)(OverviewTableRows);

