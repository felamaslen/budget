import React, { useMemo } from 'react';

import { NetWorthViewRow } from './net-worth-view-row';
import { Retirement } from './retirement';
import * as Styled from './styles';
import SumByCategory, { Props as SumProps } from './sum-by-category';
import { NetWorthGraph, GraphProps, getFTISeries } from '~client/components/net-worth/graph';
import { useIsMobile } from '~client/hooks';
import { Aggregate } from '~client/types/enum';

type Props = Pick<SumProps, 'aggregate'> & Pick<GraphProps, 'table'>;

export const NetWorthView: React.FC<Props> = ({ table, aggregate }) => {
  const isMobile = useIsMobile();
  const ftiSeries = useMemo(() => getFTISeries(table), [table]);

  return (
    <Styled.NetWorthView>
      <Styled.Table>
        <table>
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
                <Retirement ftiSeries={ftiSeries} />
              </Styled.HeaderRetirement>
            </Styled.RowSubtitle>
          </thead>
          <tbody>
            {table.map((row) => (
              <NetWorthViewRow key={row.id} isMobile={isMobile} {...row} />
            ))}
          </tbody>
        </table>
      </Styled.Table>
      <Styled.Graphs>
        <NetWorthGraph isMobile={isMobile} table={table} />
      </Styled.Graphs>
    </Styled.NetWorthView>
  );
};
