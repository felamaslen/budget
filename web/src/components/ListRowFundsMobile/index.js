import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '~client/modules/format';
import {
    transactionsListShape,
    getTotalCost,
    isSold,
} from '~client/modules/data';

import * as Styled from './styles';

const formatOptions = {
    abbreviate: true,
    precision: 1,
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
        <Styled.FundValue>
            <Styled.Cost className="cost-value">
                {formatCurrency(getTotalCost(transactions), formatOptions)}
            </Styled.Cost>
            <Styled.Value className="actual-value">
                {actualValueFormatted}
            </Styled.Value>
        </Styled.FundValue>
    );
}

ListRowFundsMobile.propTypes = {
    item: PropTypes.shape({
        transactions: transactionsListShape,
        gain: PropTypes.shape({
            value: PropTypes.number.isRequired,
        }),
    }).isRequired,
};
