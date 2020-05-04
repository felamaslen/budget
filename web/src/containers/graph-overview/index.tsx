import { useSelector } from 'react-redux';
import React from 'react';
import Media from 'react-media';

import { CostProcessed } from '~client/types/overview';
import { getWindowWidth } from '~client/selectors/app';
import { getTargets } from '~client/selectors/graph';
import { getProcessedCost } from '~client/selectors/overview';
import { getNetWorthSummaryOld } from '~client/selectors/overview/net-worth';
import { getStartDate, getFutureMonths } from '~client/selectors/overview/common';
import { getCurrentDate } from '~client/selectors/now';

import { mediaQueryMobile } from '~client/constants';
import { GRAPH_WIDTH } from '~client/constants/graph';
import { GraphBalance } from '~client/components/graph-balance';
import { GraphSpending } from '~client/components/graph-spending';

import * as Styled from './styles';

export const GraphOverviewWrapped: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const now: Date = useSelector(getCurrentDate);
  const startDate: Date = useSelector(getStartDate);
  const windowWidth = useSelector(getWindowWidth);
  const graphWidth: number = Math.min(windowWidth, GRAPH_WIDTH);
  const cost: CostProcessed = useSelector(getProcessedCost);
  const netWorthOld = useSelector(getNetWorthSummaryOld);
  const futureMonths: number = useSelector(getFutureMonths);
  const targets = useSelector(getTargets);

  const graphProps = {
    now,
    startDate,
    graphWidth,
  };

  return (
    <Styled.GraphOverview data-testid="graph-overview">
      <GraphBalance
        isMobile={isMobile}
        {...graphProps}
        futureMonths={futureMonths}
        cost={cost}
        netWorthOld={netWorthOld}
        targets={targets}
      />
      {!isMobile && (
        <GraphSpending {...graphProps} valuesNet={cost.net} valuesSpending={cost.spending} />
      )}
    </Styled.GraphOverview>
  );
};

const GraphOverview: React.FC = () => (
  <Media query={mediaQueryMobile}>
    {(isMobile: boolean): React.ReactNode => <GraphOverviewWrapped isMobile={isMobile} />}
  </Media>
);

export default GraphOverview;
