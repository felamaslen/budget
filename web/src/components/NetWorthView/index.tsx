import React from 'react';

import { Aggregate } from '~client/types/net-worth';
import SumByCategory, { Props as SumProps } from './sum-by-category';
import NetWorthViewRow from './net-worth-view-row';
import { NetWorthGraph, GraphProps } from '~client/components/net-worth-graph';

import * as Styled from './styles';

type Props = Pick<SumProps, 'aggregate'> & GraphProps;

const NetWorthView: React.FC<Props> = ({ table, aggregate }) => (
  <Styled.NetWorthView>
    <Styled.Table>
      <thead>
        <Styled.RowCategories>
          <SumByCategory item={Aggregate.cashEasyAccess} aggregate={aggregate} />
          <SumByCategory item={Aggregate.stocks} aggregate={aggregate} />
          <Styled.Header item="assets">{'Assets'}</Styled.Header>
          <Styled.Header item="liabilities">{'Liabilities'}</Styled.Header>
          <Styled.Header rowSpan={2} item="main">
            {'Net Worth'}
          </Styled.Header>
          <Styled.Header item="expenses">{'Expenses'}</Styled.Header>
          <Styled.Header item="expenses">{'FTI'}</Styled.Header>
        </Styled.RowCategories>
        <Styled.RowSubtitle>
          <SumByCategory item={Aggregate.cashOther} aggregate={aggregate} />
          <SumByCategory item={Aggregate.pension} aggregate={aggregate} />
          <Styled.Header item="assets">{'Total (£)'}</Styled.Header>
          <Styled.Header item="liabilities">{'Total (£)'}</Styled.Header>
          <Styled.HeaderRetirement colSpan={2} item="date">
            {'Retire when > 1000'}
          </Styled.HeaderRetirement>
        </Styled.RowSubtitle>
      </thead>
      <tbody>
        {table.map(row => (
          <NetWorthViewRow key={row.id} {...row} />
        ))}
      </tbody>
    </Styled.Table>
    <Styled.Graphs>
      <NetWorthGraph table={table} />
    </Styled.Graphs>
  </Styled.NetWorthView>
);

export default NetWorthView;
