import React from 'react';
import PropTypes from 'prop-types';

import { netWorthTableShape } from '~client/prop-types/net-worth/view';
import SumByCategory from '~client/components/NetWorthView/sum-by-category';
import NetWorthViewRow from '~client/components/NetWorthView/net-worth-view-row';

import * as Styled from './styles';

export default function NetWorthView({ table, aggregate }) {
    return (
        <Styled.NetWorthView className="net-worth-view">
            <Styled.Table className="net-worth-view-table">
                <thead>
                    <Styled.RowCategories className="row-categories">
                        <SumByCategory item="cash-easy-access" aggregate={aggregate} />
                        <SumByCategory item="stocks" aggregate={aggregate} />
                        <Styled.Header item="assets">{'Assets'}</Styled.Header>
                        <Styled.Header item="liabilities">{'Liabilities'}</Styled.Header>
                        <Styled.Header rowSpan={2} item="main" className="net-worth-header">
                            {'Net Worth'}
                        </Styled.Header>
                        <Styled.Header item="expenses">{'Expenses'}</Styled.Header>
                        <Styled.Header item="expenses" className="fti">
                            {'FTI'}
                        </Styled.Header>
                    </Styled.RowCategories>
                    <Styled.RowSubtitle className="row-subtitle">
                        <SumByCategory item="cash-other" aggregate={aggregate} />
                        <SumByCategory item="pension" aggregate={aggregate} />
                        <Styled.Header item="assets">{'Total (£)'}</Styled.Header>
                        <Styled.Header item="liabilities">{'Total (£)'}</Styled.Header>
                        <Styled.HeaderRetirement colSpan={2} item="date">
                            {'Retire when FTI > 1000'}
                        </Styled.HeaderRetirement>
                    </Styled.RowSubtitle>
                </thead>
                <tbody>
                    {table.map(row => (
                        <NetWorthViewRow key={row.id} {...row} />
                    ))}
                </tbody>
            </Styled.Table>
        </Styled.NetWorthView>
    );
}

NetWorthView.propTypes = {
    table: netWorthTableShape.isRequired,
    aggregate: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
};
