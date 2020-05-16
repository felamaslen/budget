import { useSelector } from 'react-redux';
import React, { memo } from 'react';

import { mediaQueryMobile } from '~client/constants';
import { useMediaQuery } from '~client/hooks/media';
import { getOverviewTable } from '~client/selectors/overview';
import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows from './OverviewTableRows';

import * as Styled from './styles';

const OverviewTable: React.FC = () => {
  const rows = useSelector(getOverviewTable);
  const isMobile = useMediaQuery(mediaQueryMobile);

  return (
    <Styled.OverviewTable data-testid="overview-table">
      <OverviewTableHeader />
      {!!rows && <OverviewTableRows rows={rows} numToSkip={isMobile ? 19 : 0} />}
    </Styled.OverviewTable>
  );
};

export default memo(OverviewTable);
