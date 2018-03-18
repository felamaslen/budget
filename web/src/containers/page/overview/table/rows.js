import { List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Cells from './cells';

export default function OverviewTableRows({ rows, numToSkip, ...props }) {
    const rowsDisplay = rows
        .slice(numToSkip)
        .map((row, key) => {
            const rowKey = key + numToSkip;

            return <Cells {...props} key={key} row={row} rowKey={rowKey} />;
        });

    return <div>{rowsDisplay}</div>;
}

OverviewTableRows.propTypes = {
    rows: PropTypes.instanceOf(list).isRequired,
    numToSkip: PropTypes.number.isRequired
};

