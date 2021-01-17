import React, { useState } from 'react';

import * as Styled from './styles';
import { GraphBalance } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';
import { useIsMobile } from '~client/hooks';

export const GraphOverview: React.FC = () => {
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState<boolean>(false);
  return (
    <Styled.GraphOverview data-testid="graph-overview">
      <GraphBalance isMobile={isMobile} showAll={showAll} setShowAll={setShowAll} />
      {!isMobile && <GraphSpending />}
    </Styled.GraphOverview>
  );
};
