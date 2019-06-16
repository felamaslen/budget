import React, { useMemo } from 'react';

import { sortByDate } from '~client/modules/data';
import { dataPropTypes } from '~client/components/NetWorthView/prop-types';
import { SumCashEasyAccess, SumCashOther, SumStocks, SumPension } from '~client/components/NetWorthView/sum-by-category';

import './style.scss';

export default function NetWorthView({ data, categories, subcategories }) {
    const rows = useMemo(() => sortByDate(data), [data]);

    if (!(data && categories && subcategories)) {
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
                </tbody>
            </table>
        </div>
    );
}

NetWorthView.propTypes = {
    ...dataPropTypes
};
