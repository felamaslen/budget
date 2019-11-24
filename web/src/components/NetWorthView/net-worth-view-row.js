import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { formatCurrency } from '~client/modules/format';
import * as Styled from './styles';

function getShortDate(dateIso) {
    if (dateIso.month % 3 === 0) {
        return (
            <Styled.DateQuarter>
                {dateIso.year - 2000}
                {'Q'}
                {Math.floor(dateIso.month / 3)}
            </Styled.DateQuarter>
        );
    }

    return dateIso.toFormat('MMM');
}

export default function NetWorthViewRow({ date, assets, liabilities, fti, expenses }) {
    const dateShort = useMemo(() => getShortDate(date), [date]);
    const dateLong = useMemo(() => date.toLocaleString(), [date]);

    return (
        <Styled.Row>
            <Styled.Column item="date-short">{dateShort}</Styled.Column>
            <Styled.Column item="date-long">{dateLong}</Styled.Column>
            <Styled.Column item="assets">{formatCurrency(assets)}</Styled.Column>
            <Styled.Column item="liabilities">
                {formatCurrency(liabilities, {
                    brackets: true,
                })}
            </Styled.Column>
            <Styled.Column item="net-worth-value">
                {formatCurrency(assets - liabilities, {
                    brackets: true,
                })}
            </Styled.Column>
            <Styled.Column item="expenses">{formatCurrency(expenses)}</Styled.Column>
            <Styled.Column item="fti">{fti.toFixed(2)}</Styled.Column>
        </Styled.Row>
    );
}

NetWorthViewRow.propTypes = {
    date: PropTypes.instanceOf(DateTime).isRequired,
    assets: PropTypes.number.isRequired,
    liabilities: PropTypes.number.isRequired,
    expenses: PropTypes.number.isRequired,
    fti: PropTypes.number.isRequired,
};
