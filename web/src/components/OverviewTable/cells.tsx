import React from 'react';

import HoverCost from '~client/components/HoverCost';
import { TableRow } from '~client/types/overview';
import * as Styled from './styles';

type Props = {
  row: Omit<TableRow, 'key'>;
};

const OverviewTableCells: React.FC<Props> = ({ row: { cells, past, active, future } }) => (
  <Styled.Row past={past} active={active} future={future}>
    {cells.map(({ column: [key], value, rgb }) => (
      <Styled.Cell
        key={key}
        column={key}
        cellColor={rgb}
        past={past}
        active={active}
        future={future}
      >
        <HoverCost value={value} />
      </Styled.Cell>
    ))}
  </Styled.Row>
);

export default OverviewTableCells;
