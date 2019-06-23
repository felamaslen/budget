import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { getTotalCost, isSold } from '~client/modules/data';
import { PAGES } from '~client/constants/data';

const formatOptions = {
    abbreviate: true,
    precision: 1
};

export default function ListRowFundsMobile({ row: { cols, gain } }) {
    const transactions = cols[PAGES.funds.cols.indexOf('transactions')];
    const costValueFormatted = useMemo(() => formatCurrency(getTotalCost(transactions), formatOptions), [transactions]);

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
            <span className="cost-value">{costValueFormatted}</span>
            <span className="actual-value">{actualValueFormatted}</span>
        </span>
    );
}

ListRowFundsMobile.propTypes = {
    row: PropTypes.shape({
        cols: PropTypes.array.isRequired,
        gain: PropTypes.shape({
            value: PropTypes.number.isRequired
        })
    })
};
