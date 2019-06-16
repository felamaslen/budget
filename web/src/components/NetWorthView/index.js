import { List as list } from 'immutable';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import { compose } from 'redux';

import { dataPropTypes } from '~client/components/NetWorthView/prop-types';
import { SumCashEasyAccess, SumCashOther, SumStocks, SumPension } from '~client/components/NetWorthView/sum-by-category';
import NetWorthViewRow from '~client/components/NetWorthView/net-worth-view-row';

import './style.scss';

const withIsoDates = data => data.map(({ date, ...rest }) => ({
    date,
    dateIso: DateTime.fromISO(date),
    ...rest
}));

const sortByIsoDate = rows => rows.sort(({ date: dateA }, { date: dateB }) => dateA - dateB);

export default function NetWorthView({ rowDates, spending, data, categories, subcategories }) {
    const netWorthDateToRowIndex = useCallback(date => rowDates.findIndex(value =>
        value.year === date.year && value.month === date.month
    ), [rowDates]);

    const withSpend = useCallback(rows => rows.map(row => {
        let spend = 0;
        const rowIndex = netWorthDateToRowIndex(row.dateIso);
        if (rowIndex !== -1) {
            spend = spending.get(rowIndex);
        }

        return { ...row, spend };
    }), [spending, netWorthDateToRowIndex]);


    const rows = useMemo(() => compose(
        withSpend,
        sortByIsoDate,
        withIsoDates
    )(data || []), [data, withSpend]);

    if (!(categories && subcategories)) {
        return null;
    }

    const dataProps = { rows, categories, subcategories };

    return (
        <div className="net-worth-view">
            <h4 className="title">{'View'}</h4>
            <table className="net-worth-view-table">
                <thead>
                    <tr className="row-categories">
                        <SumCashEasyAccess {...dataProps} />
                        <SumStocks {...dataProps} />
                        <th className="assets">{'Assets'}</th>
                        <th className="liabilities">{'Liabilities'}</th>
                        <th rowSpan={3} className="net-worth-header">{'Net Worth'}</th>
                        <th className="expenses">{'Expenses'}</th>
                        <th className="fti">{'FTI'}</th>
                    </tr>
                    <tr className="row-subtitle">
                        <SumCashOther {...dataProps} />
                        <SumPension {...dataProps} />
                        <th rowSpan={2} className="assets">{'Total (£)'}</th>
                        <th rowSpan={2} className="liabilities">{'Total (£)'}</th>
                        <th rowSpan={2} colSpan={2} className="retirement">
                            {'Can retire when FTI > 1000 consistently'}
                        </th>
                    </tr>
                    <tr className="row-date">
                        <th colSpan={2} className="date">{'Date'}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <NetWorthViewRow key={row.id} row={row} {...dataProps} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

NetWorthView.propTypes = {
    rowDates: PropTypes.instanceOf(list).isRequired,
    spending: PropTypes.instanceOf(list).isRequired,
    ...dataPropTypes
};
