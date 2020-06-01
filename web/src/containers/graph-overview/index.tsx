import React from 'react';

import * as Styled from './styles';
import { GraphBalance } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';
import { useIsMobile } from '~client/hooks';

export const GraphOverview: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <Styled.GraphOverview data-testid="graph-overview">
      <GraphBalance isMobile={isMobile} />
      {!isMobile && <GraphSpending />}
    </Styled.GraphOverview>
  );
};
