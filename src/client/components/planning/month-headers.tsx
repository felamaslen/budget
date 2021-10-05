import formatDate from 'date-fns/format';
import React from 'react';

import * as Styled from './styles';
import type { PlanningData } from './types';

export type Props = {
  tableData: PlanningData[];
};

// first month shows start as well as end
const getMonthEndNumRows = (monthIndex: number): number => (monthIndex === 0 ? 2 : 1);

export const MonthHeaders = React.forwardRef<HTMLDivElement, Props>(({ tableData }, ref) => (
  <Styled.MonthHeaders ref={ref}>
    <Styled.MonthHeadersPadding />
    {tableData.map((row, index) => (
      <Styled.MonthHeader
        key={`month-header-${row.year}-${row.month}`}
        numRows={row.numRows + getMonthEndNumRows(index)}
        isCurrentMonth={row.isCurrentMonth}
      >
        <Styled.MonthHeaderText>{formatDate(row.date, "MMM ''yy")}</Styled.MonthHeaderText>
      </Styled.MonthHeader>
    ))}
  </Styled.MonthHeaders>
));
MonthHeaders.displayName = 'MonthHeaders';
