import React, { memo } from 'react';

import Cells from './cells';
import * as Styled from './styles';
import { OverviewTable } from '~client/types';

type Props = {
  rows: OverviewTable;
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
