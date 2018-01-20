import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import Editable from '../../../editable';
import { formatCurrency } from '../../../../misc/format';

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

    const value = cellKey > 0
        ? formatCurrency(cell.get('value'), {
            abbreviate: true,
            precision: 1,
            brackets: true
        })
        : cell.get('value');

    return <span className="text">{value}</span>;
}

OverviewTableCellInner.propTypes = {
    cell: PropTypes.instanceOf(map).isRequired,
    cellKey: PropTypes.number.isRequired,
    rowKey: PropTypes.number.isRequired,
    editable: PropTypes.bool.isRequired
};

