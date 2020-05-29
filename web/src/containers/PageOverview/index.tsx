import React from 'react';
import { Route } from 'react-router-dom';

import * as Styled from './styles';
import OverviewTable from '~client/components/OverviewTable';
import { GraphOverview } from '~client/containers/graph-overview';
import NetWorth from '~client/containers/NetWorth';

const PageOverview: React.FC = () => (
  <>
    <Styled.Page>
      <OverviewTable />
      <GraphOverview />
    </Styled.Page>
    <Route path="/net-worth" component={NetWorth} />
  </>
);

export default PageOverview;
