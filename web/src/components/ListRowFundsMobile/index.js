import { Map as map } from 'immutable';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import { getTotalCost, isSold } from '~client/modules/data';
import { PAGES } from '~client/constants/data';

const formatOptions = {
    abbreviate: true,
    precision: 1
};

export default function ListRowFundsMobile({ row }) {
    const transactions = row.getIn(['cols', PAGES.funds.cols.indexOf('transactions')]);
    const gain = row.get('gain');
    const costValueFormatted = useMemo(() => formatCurrency(getTotalCost(transactions), formatOptions), [transactions]);

    const actualValueFormatted = useMemo(() => {
        if (!gain) {
            return null;
        }
        if (isSold(transactions)) {
            return '\u2013';
        }

        return formatCurrency(gain.get('value'), formatOptions);
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
    row: PropTypes.instanceOf(map).isRequired
};
