import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../helpers/format';

export default function ListRowFundsMobile({ row, colKeys }) {
    const cost = row.getIn(['cols', colKeys[2]]);
    const gain = row.get('gain');

    if (!gain) {
        return null;
    }

    const formatOptions = {
        abbreviate: true,
        precision: 1
    };

    const costValue = (
        <span className="cost-value">
            {formatCurrency(cost, formatOptions)}
        </span>
    );

    const value = cost
        ? formatCurrency(gain.get('value'), formatOptions)
        : '\u2013';

    const actualValue = <span className="actual-value">{value}</span>;

    return (
        <span className="cost">
            {costValue}
            {actualValue}
        </span>
    );
}

ListRowFundsMobile.propTypes = {
    row: PropTypes.instanceOf(map).isRequired,
    colKeys: PropTypes.array.isRequired
};

