import { Map as map } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../helpers/format';
import { PAGES } from '../../constants/data';

export default function ListRowFundsMobile({ row }) {
    const transactions = row.getIn(['cols', PAGES.funds.cols.indexOf('transactions')]);
    const gain = row.get('gain');
    if (!gain) {
        return null;
    }

    const cost = transactions.getTotalCost();

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

