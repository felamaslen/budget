/** @jsx jsx */
import { jsx } from '@emotion/react';

import * as Styled from './styles';
import HoverCost from '~client/components/hover-cost';
import type { OverviewTableRow, OverviewTableColumn } from '~client/types';

type Props = {
  row: OverviewTableRow;
  columns: OverviewTableColumn[];
};

type PropsCell = Styled.PropsCell & Pick<OverviewTableRow, 'year' | 'month'>;

const Cell: React.FC<PropsCell> = ({ year, month, cellColor, children, ...props }) => (
  <Styled.Cell style={{ backgroundColor: cellColor ?? undefined }} {...props}>
    {children}
  </Styled.Cell>
);

export const OverviewTableCells: React.FC<Props> = ({
  columns,
  row: { year, month, monthText, cells, past, active, future },
}) => (
  <Styled.Row past={past} active={active} future={future}>
    <Styled.Cell key="month" column="month" past={past} active={active} future={future}>
      {monthText}
    </Styled.Cell>
    {columns.map(([column]) => (
      <Cell
        key={column}
        year={year}
        month={month}
        column={column}
        cellColor={cells[column].rgb}
        past={past}
        active={active}
        future={future}
      >
        <HoverCost value={cells[column].value} />
      </Cell>
    ))}
  </Styled.Row>
);
