import React, { memo } from 'react';
import Media from 'react-media';

import { mediaQueryMobile } from '~client/constants';
import OverviewTableHeader from './OverviewTableHeader';
import OverviewTableRows, { Props as RowsProps } from './OverviewTableRows';

import * as Styled from './styles';

type Props = {
  rows: RowsProps['rows'] | null;
};

const OverviewTable: React.FC<Props> = ({ rows }) => (
  <Styled.OverviewTable data-testid="overview-table">
    <OverviewTableHeader />
    {!!rows && (
      <Media query={mediaQueryMobile}>
        {(isMobile: boolean): React.ReactElement => (
          <OverviewTableRows rows={rows} numToSkip={isMobile ? 19 : 0} />
        )}
      </Media>
    )}
  </Styled.OverviewTable>
);

export default memo(OverviewTable);
