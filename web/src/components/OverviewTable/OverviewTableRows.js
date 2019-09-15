import React from 'react';
import PropTypes from 'prop-types';
import Cells from './cells';

const OverviewTableRows = ({ rows, numToSkip, ...props }) => (
    <div className="table-overview-rows">{rows.slice(numToSkip)
        .map(({ key, ...row }) => (
            <Cells key={key}
                {...props}
                row={row}
            />
        ))
    }</div>
);

OverviewTableRows.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    numToSkip: PropTypes.number.isRequired,
};

export default OverviewTableRows;
