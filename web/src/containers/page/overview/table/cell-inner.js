import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import getEditable from '../../../editable';
import { formatCurrency } from '../../../../misc/format';

export default function OverviewTableCellInner({ pageIndex, cell, cellKey, rowKey, editable }) {
    if (editable) {
        // editable balance column
        const Editable = getEditable({
            row: rowKey,
            col: 0,
            id: null,
            item: 'cost',
            value: cell.get('value')
        });

        return <Editable pageIndex={pageIndex} />;
    }

    const value = cellKey > 0
        ? formatCurrency(cell.get('value'), { abbreviate: true, precision: 1 })
        : cell.get('value');

    return <span className="text">{value}</span>;
}

OverviewTableCellInner.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    cell: PropTypes.instanceOf(map).isRequired,
    cellKey: PropTypes.number.isRequired,
    rowKey: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired
};

