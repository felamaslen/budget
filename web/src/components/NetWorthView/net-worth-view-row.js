import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { formatCurrency } from '~client/modules/format';

function getShortDate(dateIso) {
    if (dateIso.month % 3 === 0) {
        return (
            <span className="date-short-quarter">
                {dateIso.year - 2000}{'Q'}{Math.floor(dateIso.month / 3)}
            </span>
        );
    }

    return dateIso.toFormat('MMM');
}

export default function NetWorthViewRow({
    date, assets, liabilities, fti, expenses,
}) {
    const dateShort = useMemo(() => getShortDate(date), [date]);
    const dateLong = useMemo(() => date.toLocaleString(), [date]);

    return (
        <tr className="net-worth-view-row">
            <td className="date-short">{dateShort}</td>
            <td className="date-long">{dateLong}</td>
            <td className="assets">{formatCurrency(assets)}</td>
            <td className="liabilities">{formatCurrency(liabilities, {
                brackets: true,
            })}</td>
            <td className="net-worth-value">{formatCurrency(assets - liabilities, {
                brackets: true,
            })}</td>
            <td className="expenses">{formatCurrency(expenses)}</td>
            <td className="fti">{fti.toFixed(2)}</td>
        </tr>
    );
}

NetWorthViewRow.propTypes = {
    date: PropTypes.instanceOf(DateTime).isRequired,
    assets: PropTypes.number.isRequired,
    liabilities: PropTypes.number.isRequired,
    expenses: PropTypes.number.isRequired,
    fti: PropTypes.number.isRequired,
};
