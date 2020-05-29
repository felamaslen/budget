import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';
import * as Styled from './styles';
import { mediaQueryMobile } from '~client/constants';
import { useMediaQuery } from '~client/hooks/media';
import { useToday } from '~client/hooks/time';
import { getOverviewTable } from '~client/selectors/overview';

const OverviewTable: React.FC = () => {
  const today = useToday();
  const rows = useSelector(getOverviewTable(today));
  const isMobile = useMediaQuery(mediaQueryMobile);

  return (
    <Styled.OverviewTable data-testid="overview-table">
      <OverviewTableHeader />
      {!!rows && <OverviewTableRows rows={rows} numToSkip={isMobile ? 19 : 0} />}
    </Styled.OverviewTable>
  );
};

export default memo(OverviewTable);
