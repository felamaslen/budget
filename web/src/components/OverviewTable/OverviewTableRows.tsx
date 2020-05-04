import React, { memo } from 'react';

import Cells from './cells';
import { Table } from '~client/types/overview';
import * as Styled from './styles';

export type Props = {
  rows: Table;
  numToSkip: number;
};

const OverviewTableRows: React.FC<Props> = ({ rows, numToSkip }) => (
  <Styled.Rows>
    {rows.slice(numToSkip).map(({ key, ...row }) => (
      <Cells key={key} row={row} />
    ))}
  </Styled.Rows>
);

export default memo(OverviewTableRows);
