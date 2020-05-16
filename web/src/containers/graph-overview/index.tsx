import React from 'react';
import Media from 'react-media';

import { mediaQueryMobile } from '~client/constants';
import { GraphBalance } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';

import * as Styled from './styles';

export const GraphOverviewWrapped: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  return (
    <Styled.GraphOverview data-testid="graph-overview">
      <GraphBalance isMobile={isMobile} />
      {!isMobile && <GraphSpending />}
    </Styled.GraphOverview>
  );
};

const GraphOverview: React.FC = () => (
  <Media query={mediaQueryMobile}>
    {(isMobile: boolean): React.ReactNode => <GraphOverviewWrapped isMobile={isMobile} />}
  </Media>
);

export default GraphOverview;
