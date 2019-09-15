import React from 'react';
import PropTypes from 'prop-types';

import { netWorthTableShape } from '~client/prop-types/net-worth/view';
import SumByCategory from '~client/components/NetWorthView/sum-by-category';
import NetWorthViewRow from '~client/components/NetWorthView/net-worth-view-row';

import './style.scss';

export default function NetWorthView({ table, aggregate }) {
    return (
        <div className="net-worth-view">
            <table className="net-worth-view-table">
                <thead>
                    <tr className="row-categories">
                        <SumByCategory className="cash-easy-access" aggregate={aggregate} />
                        <SumByCategory className="stocks" aggregate={aggregate} />
                        <th className="assets">{'Assets'}</th>
                        <th className="liabilities">{'Liabilities'}</th>
                        <th rowSpan={2} className="net-worth-header">{'Net Worth'}</th>
                        <th className="expenses">{'Expenses'}</th>
                        <th className="fti">{'FTI'}</th>
                    </tr>
                    <tr className="row-subtitle">
                        <SumByCategory className="cash-other" aggregate={aggregate} />
                        <SumByCategory className="pension" aggregate={aggregate} />
                        <th className="assets">{'Total (£)'}</th>
                        <th className="liabilities">{'Total (£)'}</th>
                        <th colSpan={2} className="retirement">
                            {'Retire when FTI > 1000'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {table.map((row) => <NetWorthViewRow key={row.id} {...row} />)}
                </tbody>
            </table>
        </div>
    );
}

NetWorthView.propTypes = {
    table: netWorthTableShape.isRequired,
    aggregate: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
};
