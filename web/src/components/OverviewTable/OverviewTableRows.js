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

    return (
        <div className="table-overview-rows">
            {rowsDisplay}
        </div>
    );
}

OverviewTableRows.propTypes = {
    rows: PropTypes.array.isRequired,
    numToSkip: PropTypes.number.isRequired
};
