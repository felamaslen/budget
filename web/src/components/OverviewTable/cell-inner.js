import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Editable from '../../containers/Editable';
import HoverCost from '../../components/HoverCost';

export default function OverviewTableCellInner({ cell, cellKey, rowKey, editable }) {
    if (editable) {
        // editable balance column
        const props = {
            page: 'overview',
            row: rowKey,
            col: 0,
            id: null,
            item: 'cost',
            value: cell.get('value')
        };

        return <Editable {...props} />;
    }

    return (
        <span className="text">
            <HoverCost value={cell.get('value')} abbreviate={cellKey > 0} />
        </span>
    );
}

OverviewTableCellInner.propTypes = {
    cell: PropTypes.instanceOf(map).isRequired,
    cellKey: PropTypes.number.isRequired,
    rowKey: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired
};

