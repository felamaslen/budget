import React, { memo } from 'react';

import { mediaQueryMobile } from '~client/constants';
import { useMediaQuery } from '~client/hooks/media';
import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows, { Props as RowsProps } from './OverviewTableRows';

import * as Styled from './styles';

type Props = {
  rows: RowsProps['rows'] | null;
};

const OverviewTable: React.FC<Props> = ({ rows }) => {
  const isMobile = useMediaQuery(mediaQueryMobile);

  return (
    <Styled.OverviewTable data-testid="overview-table">
      <OverviewTableHeader />
      {!!rows && <OverviewTableRows rows={rows} numToSkip={isMobile ? 19 : 0} />}
    </Styled.OverviewTable>
  );
};

export default memo(OverviewTable);
