import React, { useMemo } from 'react';

import { formatCurrency } from '~client/modules/format';
import { netWorthItem } from '~client/components/NetWorthList/prop-types';
import { dataPropTypes } from '~client/components/NetWorthView/prop-types';
import { sumByType } from '~client/components/NetWorthView/calc';

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

export default function NetWorthViewRow({ row, categories, subcategories }) {
    const dateShort = useMemo(() => getShortDate(row.dateIso), [row.dateIso]);
    const dateLong = useMemo(() => row.dateIso.toLocaleString(), [row.dateIso]);

    const dataProps = useMemo(() => ({ row, categories, subcategories }), [row, categories, subcategories]);

    const totalAssets = useMemo(() => sumByType('asset', dataProps), [dataProps]);
    const totalLiabilities = useMemo(() => sumByType('liability', dataProps), [dataProps]);

    const netWorthValue = totalAssets + totalLiabilities;

    const assets = useMemo(() => formatCurrency(totalAssets), [totalAssets]);

    const liabilities = useMemo(() => formatCurrency(totalLiabilities, {
        brackets: true
    }), [totalLiabilities]);

    const netWorthFormatted = useMemo(() => formatCurrency(netWorthValue, {
        brackets: true
    }), [netWorthValue]);

    return (
        <tr className="net-worth-view-row">
            <td className="date-short">{dateShort}</td>
            <td className="date-long">{dateLong}</td>
            <td className="assets">{assets}</td>
            <td className="liabilities">{liabilities}</td>
            <td className="net-worth-value">{netWorthFormatted}</td>
            <td className="expenses">{formatCurrency(row.spend)}</td>
        </tr>
    );
}

NetWorthViewRow.propTypes = {
    row: netWorthItem.isRequired,
    ...dataPropTypes
};
