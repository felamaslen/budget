import React from 'react';
import { Route } from 'react-router-dom';

import * as Styled from './styles';
import { GraphOverview } from '~client/components/graph-overview';
import { NetWorth } from '~client/components/net-worth';
import { OverviewTable } from '~client/components/overview-table';

export const PageOverview: React.FC = () => (
  <>
    <Route path="/net-worth" component={NetWorth} />
    <Styled.Page>
      <OverviewTable />
      <GraphOverview />
    </Styled.Page>
  </>
);
