import React from 'react';
import PropTypes from 'prop-types';
import HoverCost from '~client/components/HoverCost';

const OverviewTableCellInner = ({ cell, cellKey }) => (
    <span className="text">
        <HoverCost value={cell.value} abbreviate={cellKey > 0} />
    </span>
);

OverviewTableCellInner.propTypes = {
    cell: PropTypes.shape({
        value: PropTypes.any
    }),
    cellKey: PropTypes.number.isRequired
};

export default OverviewTableCellInner;
