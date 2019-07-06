import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { transactionsListShape, getTotalCost, isSold } from '~client/modules/data';

const formatOptions = {
    abbreviate: true,
    precision: 1
};

export default function ListRowFundsMobile({ item: { transactions, gain } }) {
    const actualValueFormatted = useMemo(() => {
        if (!gain) {
            return null;
        }
        if (isSold(transactions)) {
            return '\u2013';
        }

        return formatCurrency(gain.value, formatOptions);
    }, [transactions, gain]);

    if (!gain) {
        return null;
    }

    return (
        <span className="cost">
            <span className="cost-value">{formatCurrency(getTotalCost(transactions), formatOptions)}</span>
            <span className="actual-value">{actualValueFormatted}</span>
        </span>
    );
}

ListRowFundsMobile.propTypes = {
    item: PropTypes.shape({
        transactions: transactionsListShape,
        gain: PropTypes.shape({
            value: PropTypes.number.isRequired
        })
    }).isRequired
};
