import React from 'react';

import * as Styled from './styles';
import HoverCost from '~client/components/HoverCost';
import { OverviewTableRow } from '~client/types';

type Props = {
  row: Omit<OverviewTableRow, 'key'>;
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
