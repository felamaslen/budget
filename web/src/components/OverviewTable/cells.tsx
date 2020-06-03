import React from 'react';

import * as Styled from './styles';
import HoverCost from '~client/components/HoverCost';
import { OverviewTableRow, OverviewTableColumn } from '~client/types';

type Props = {
  row: OverviewTableRow;
  columns: OverviewTableColumn[];
};

export const OverviewTableCells: React.FC<Props> = ({
  columns,
  row: { month, cells, past, active, future },
}) => (
  <Styled.Row past={past} active={active} future={future}>
    <Styled.Cell key="month" column="month" past={past} active={active} future={future}>
      {month}
    </Styled.Cell>
    {columns.map(([column]) => (
      <Styled.Cell
        key={column}
        column={column}
        cellColor={cells[column].rgb}
        past={past}
        active={active}
        future={future}
      >
        <HoverCost value={cells[column].value} />
      </Styled.Cell>
    ))}
  </Styled.Row>
);
